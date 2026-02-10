import Anthropic from '@anthropic-ai/sdk';
import type { ClassifiedItem } from './types';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];
const FALLBACK_MESSAGE = "Today's briefing is being prepared. Check back shortly.";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callSummaryApi(
  client: Anthropic,
  items: ClassifiedItem[],
  previousSummary?: string
): Promise<string | null> {
  const itemLines = items
    .map((item, i) => {
      const excerpt = item.excerpt ? item.excerpt.slice(0, 200) : '(no excerpt)';
      return `${i + 1}. [${item.source}/${item.category}] "${item.title}" — ${excerpt}`;
    })
    .join('\n');

  const continuityLine = previousSummary
    ? `\nYesterday's summary for continuity: ${previousSummary}`
    : '';

  const prompt = `You are the editor of "Morning with Coffee & Claude," a daily Claude Code ecosystem briefing.
Write a 2-4 sentence conversational summary highlighting the top 3 developments from today.
Tone: like a tech newsletter intro — warm, opinionated, not sterile.

Today's top items:
${itemLines}
${continuityLine}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        return textBlock.text.trim();
      }

      throw new Error('No text content in response');
    } catch (error) {
      console.error(`[summarizer] API error on attempt ${attempt + 1}:`, error instanceof Error ? error.message : error);

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  return null;
}

export async function generateSummary(
  items: ClassifiedItem[],
  previousSummary?: string
): Promise<string> {
  if (items.length === 0) {
    return previousSummary ?? FALLBACK_MESSAGE;
  }

  // Select top 10 items by engagement score
  const topItems = [...items]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 10);

  const client = new Anthropic();
  const result = await callSummaryApi(client, topItems, previousSummary);

  // Fallback chain
  if (result) {
    return result;
  }

  if (previousSummary) {
    console.log('[summarizer] API failed — falling back to previous summary');
    return previousSummary;
  }

  console.log('[summarizer] All fallbacks exhausted — returning default message');
  return FALLBACK_MESSAGE;
}
