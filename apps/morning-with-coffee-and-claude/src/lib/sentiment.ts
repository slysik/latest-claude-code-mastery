import Anthropic from '@anthropic-ai/sdk';
import type { FetchedItem, ClassifiedItem } from './types';

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];
const CIRCUIT_BREAKER_THRESHOLD = 2;

interface ClassificationResult {
  index: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  topic: string;
  one_line_quote: string | null;
  is_tip: boolean;
  tip_confidence: number | null;
}

function toUnclassified(item: FetchedItem): ClassifiedItem {
  return {
    ...item,
    sentiment: null,
    sentimentConfidence: null,
    topicTags: [],
    oneLineQuote: null,
    isTip: false,
    tipConfidence: null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonResponse(text: string): ClassificationResult[] | null {
  const trimmed = text.trim();
  // Strip markdown code fences if present
  const stripped = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed)) {
      return parsed as ClassificationResult[];
    }
    return null;
  } catch {
    return null;
  }
}

async function classifyBatch(
  client: Anthropic,
  batch: FetchedItem[],
  startIndex: number
): Promise<ClassificationResult[] | null> {
  const itemLines = batch
    .map((item, i) => {
      const idx = startIndex + i + 1;
      const excerpt = item.excerpt ? item.excerpt.slice(0, 300) : '(no excerpt)';
      return `${idx}. [${item.title}]: ${excerpt}`;
    })
    .join('\n');

  const prompt = `Classify these Claude Code community items. For each, determine:
1. Sentiment: positive, neutral, or negative
2. Confidence: 0.0 to 1.0
3. Topic: main topic (1-3 words)
4. Quote: one standout line from the content (or null)
5. Is this an actionable tip? (true/false)
6. Tip confidence: 0.0 to 1.0 (only if is_tip=true)

Return ONLY a JSON array (no markdown fences). Each object must include the index field.

Items:
${itemLines}

Response format: [{"index": 1, "sentiment": "positive", "confidence": 0.9, "topic": "hooks", "one_line_quote": "...", "is_tip": false, "tip_confidence": null}, ...]`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in response');
      }

      const results = parseJsonResponse(textBlock.text);
      if (results) {
        return results;
      }

      // Parse failure — if we have retries left, try again
      console.error(`[sentiment] Parse failure on attempt ${attempt + 1} for batch starting at ${startIndex}`);
    } catch (error) {
      console.error(`[sentiment] API error on attempt ${attempt + 1}:`, error instanceof Error ? error.message : error);
    }

    if (attempt < MAX_RETRIES - 1) {
      await sleep(RETRY_DELAYS[attempt]);
    }
  }

  return null;
}

function mapResultToClassified(
  item: FetchedItem,
  result: ClassificationResult | undefined
): ClassifiedItem {
  if (!result) {
    return toUnclassified(item);
  }

  const validSentiments = ['positive', 'neutral', 'negative'] as const;
  const sentiment = validSentiments.includes(result.sentiment as typeof validSentiments[number])
    ? (result.sentiment as 'positive' | 'neutral' | 'negative')
    : null;

  const isTip = result.is_tip === true && typeof result.tip_confidence === 'number' && result.tip_confidence > 0.8;

  return {
    ...item,
    sentiment,
    sentimentConfidence: typeof result.confidence === 'number' ? result.confidence : null,
    topicTags: result.topic ? [result.topic] : [],
    oneLineQuote: result.one_line_quote ?? null,
    isTip,
    tipConfidence: isTip && typeof result.tip_confidence === 'number' ? result.tip_confidence : null,
  };
}

export async function classifyItems(items: FetchedItem[]): Promise<ClassifiedItem[]> {
  if (items.length === 0) {
    return [];
  }

  const client = new Anthropic();
  const classified: ClassifiedItem[] = new Array(items.length);
  let consecutiveFailures = 0;
  let circuitOpen = false;

  // Create batches
  const batches: { start: number; items: FetchedItem[] }[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push({
      start: i,
      items: items.slice(i, i + BATCH_SIZE),
    });
  }

  for (const batch of batches) {
    if (circuitOpen) {
      // Skip remaining batches — fill with unclassified
      for (let j = 0; j < batch.items.length; j++) {
        classified[batch.start + j] = toUnclassified(batch.items[j]);
      }
      continue;
    }

    const results = await classifyBatch(client, batch.items, batch.start);

    if (!results) {
      // Batch failed all retries
      consecutiveFailures++;
      for (let j = 0; j < batch.items.length; j++) {
        classified[batch.start + j] = toUnclassified(batch.items[j]);
      }

      if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitOpen = true;
        const remaining = items.length - (batch.start + batch.items.length);
        if (remaining > 0) {
          console.error(`[sentiment] Circuit breaker open — skipping ${remaining} remaining items`);
        }
      }
      continue;
    }

    // Success — reset consecutive failure counter
    consecutiveFailures = 0;

    // Map results by index
    const resultMap = new Map<number, ClassificationResult>();
    for (const r of results) {
      resultMap.set(r.index, r);
    }

    for (let j = 0; j < batch.items.length; j++) {
      const expectedIndex = batch.start + j + 1; // 1-based index in prompt
      const result = resultMap.get(expectedIndex);
      classified[batch.start + j] = mapResultToClassified(batch.items[j], result);
    }
  }

  const unclassifiedCount = classified.filter((item) => item.sentiment === null).length;
  if (unclassifiedCount > 0) {
    console.log(`[sentiment] ${unclassifiedCount}/${items.length} items unclassified`);
  }

  return classified;
}
