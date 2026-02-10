import {
  Application,
  ActionPlanner,
  OpenAIModel,
  PromptManager,
  TurnState,
  DefaultTempState,
  DefaultConversationState,
  DefaultUserState,
} from "@microsoft/teams-ai";
import { MemoryStorage } from "botbuilder";
import path from "path";
import { searchService } from "./services/search.js";
import { loggerService } from "./services/logger.js";
import { config } from "./config.js";

// Extend DefaultTempState with custom properties for RAG and logging
interface AppTempState extends DefaultTempState {
  startTime?: number;
  context?: string;
  searchResults?: any[];
  userQuery?: string;
  lastResponse?: string;
}

// Define custom TurnState with extended temp state
type ApplicationTurnState = TurnState<DefaultConversationState, DefaultUserState, AppTempState>;

// Create AI components
const model = new OpenAIModel({
  azureApiKey: config.azureOpenAI.apiKey,
  azureEndpoint: config.azureOpenAI.endpoint,
  azureDefaultDeployment: config.azureOpenAI.chatDeployment,
  azureApiVersion: config.azureOpenAI.apiVersion,
});

const prompts = new PromptManager({
  promptsFolder: path.join(__dirname, "prompts"),
});

const planner = new ActionPlanner<ApplicationTurnState>({
  model,
  prompts,
  defaultPrompt: "chat",
});

// Create the Application
export const app = new Application<ApplicationTurnState>({
  storage: new MemoryStorage(),
  ai: {
    planner,
  },
});

// Before turn: perform RAG search
app.turn("beforeTurn", async (context, state) => {
  const userMessage = context.activity.text || "";

  // Track start time for response timing
  state.temp.startTime = Date.now();

  // Perform semantic search
  const searchResults = await searchService.searchDocuments(userMessage, 3);

  // Join search results into context
  const contextText = searchResults
    .map((result, idx) => {
      return `[Source ${idx + 1}: ${result.section}]\n${result.content}`;
    })
    .join("\n\n---\n\n");

  // Store context and metadata in temp state
  state.temp.context = contextText;
  state.temp.searchResults = searchResults;
  state.temp.userQuery = userMessage;

  return true;
});

// After turn: log the interaction
app.turn("afterTurn", async (context, state) => {
  const responseTimeMs = Date.now() - (state.temp.startTime || Date.now());
  const searchResults = state.temp.searchResults || [];
  const response = state.temp.lastResponse || "";

  // Calculate average confidence score from search results
  const avgConfidence =
    searchResults.length > 0
      ? searchResults.reduce((sum: number, r: any) => sum + r.score, 0) / searchResults.length
      : 0;

  // Log the interaction
  await loggerService.logInteraction({
    userId: context.activity.from.id,
    userName: context.activity.from.name || "Unknown",
    query: state.temp.userQuery || "",
    response,
    sources: searchResults.map((r: any) => `${r.section}: ${r.content.substring(0, 100)}...`),
    confidenceScore: avgConfidence,
    conversationId: context.activity.conversation.id,
    responseTimeMs,
  });

  return true;
});

// Handle /help command
app.message("/help", async (context: any) => {
  const helpMessage = `**Travel Policy Assistant**\n\n` +
    `I can help you understand the Gates Foundation travel policy for India.\n\n` +
    `**Commands:**\n` +
    `- Ask any question about the travel policy\n` +
    `- \`/help\` - Show this help message\n` +
    `- \`/sources\` - Learn about data sources\n\n` +
    `**Examples:**\n` +
    `- "What are the vaccination requirements?"\n` +
    `- "How do I book accommodation?"\n` +
    `- "What's the per diem rate?"`;

  await context.sendActivity(helpMessage);
});

// Handle /sources command
app.message("/sources", async (context: any) => {
  const sourcesMessage = `**Data Sources**\n\n` +
    `This assistant uses the official Gates Foundation Travel Policy document for India.\n\n` +
    `The document is indexed using Azure AI Search with semantic search capabilities. ` +
    `All answers are based solely on the content of this policy document.\n\n` +
    `Index: ${config.azureSearch.indexName}`;

  await context.sendActivity(sourcesMessage);
});

// Initialize services
export async function initializeBot(): Promise<void> {
  await loggerService.initialize();
  console.log("Bot initialized successfully");
}
