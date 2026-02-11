import Anthropic from '@anthropic-ai/sdk';
import type { ClassifiedItem, BriefingSlot, BriefingTldr } from './types';

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
      return `${i + 1}. [${item.source}/${item.category}] "${item.title}" (${item.url}) — ${excerpt}`;
    })
    .join('\n');

  const continuityLine = previousSummary
    ? `\nYesterday's summary for continuity: ${previousSummary}`
    : '';

  const prompt = `You are the editor of "Morning with Coffee & Claude," a daily Claude Code ecosystem briefing.
Write a 3-5 sentence conversational summary highlighting the top 3 developments from today.
Tone: like a tech newsletter intro — warm, opinionated, not sterile.

CRITICAL RULES:
1. When you mention a tool, project, or article, link to it using markdown: [name](url). Use ONLY the URLs provided in the items below — NEVER invent or guess URLs.
2. NEVER fabricate install commands, brew formulas, CLI commands, or signup links. If the source excerpt mentions a specific command, you may quote it. Otherwise, just link to the source and let the reader find instructions there.
3. If you want to suggest an action (like "check it out" or "try it"), link to the actual source URL.
4. DO NOT end with questions like "Would you like me to elaborate?" — this is a static briefing, not a conversation.

Today's top items:
${itemLines}
${continuityLine}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 768,
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

const SLOT_CONTEXT: Record<BriefingSlot, string> = {
  morning: 'Focus on what changed overnight: new releases, announcements, breaking news. The "try today" should be a concrete experiment the user can run in their Claude Code repo.',
  midday: 'Focus on patterns, configurations, and workflows. The "try today" should be a specific config pattern or workflow snippet to paste into their setup.',
  evening: 'Focus on community discussion and reflection. The "try today" should be something to try tomorrow based on what the community learned today.',
};

async function callTldrApi(
  client: Anthropic,
  slot: BriefingSlot,
  items: ClassifiedItem[],
): Promise<BriefingTldr | null> {
  const itemLines = items
    .slice(0, 15)
    .map((item, i) => {
      const excerpt = item.excerpt ? item.excerpt.slice(0, 200) : '(no excerpt)';
      return `${i + 1}. [${item.source}/${item.category}] "${item.title}" — ${excerpt}`;
    })
    .join('\n');

  const prompt = `You are the editor of "Morning with Coffee & Claude," a Claude Code ecosystem briefing.

Generate a structured TL;DR for the ${slot} briefing slot.

${SLOT_CONTEXT[slot]}

Items for this briefing:
${itemLines}

Respond with ONLY valid JSON matching this exact shape (no markdown, no code fences):
{
  "facts": ["fact 1", "fact 2", "fact 3"],
  "tryToday": "one actionable experiment or null",
  "insight": "one opinionated observation or null"
}

Rules:
- facts: 3-5 bullet points, each a single sentence
- tryToday: One concrete, specific action. null if nothing actionable
- insight: One opinionated take with a newsletter-editor voice. null if nothing insightful
- Do NOT include markdown links in facts — keep them plain text`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in response');
      }

      const parsed = JSON.parse(textBlock.text.trim()) as BriefingTldr;

      // Validate shape
      if (!Array.isArray(parsed.facts)) {
        throw new Error('Invalid facts array');
      }

      return {
        facts: parsed.facts.slice(0, 5),
        tryToday: typeof parsed.tryToday === 'string' ? parsed.tryToday : null,
        insight: typeof parsed.insight === 'string' ? parsed.insight : null,
      };
    } catch (error) {
      console.error(
        `[tldr] API error on attempt ${attempt + 1}:`,
        error instanceof Error ? error.message : error,
      );

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  return null;
}

export async function generateBriefingTldr(
  slot: BriefingSlot,
  items: ClassifiedItem[],
): Promise<BriefingTldr> {
  if (items.length === 0) {
    return { facts: [], tryToday: null, insight: null };
  }

  const topItems = [...items]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 15);

  const client = new Anthropic();
  const result = await callTldrApi(client, slot, topItems);

  if (result) {
    return result;
  }

  // Fallback: generate facts from top item titles
  console.log('[tldr] API failed — falling back to item titles');
  const fallbackFacts = topItems
    .slice(0, 5)
    .map((item) => item.title);

  return {
    facts: fallbackFacts,
    tryToday: null,
    insight: null,
  };
}
