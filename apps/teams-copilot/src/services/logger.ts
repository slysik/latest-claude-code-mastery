import { CosmosClient, Container, Database } from "@azure/cosmos";
import appInsights from "applicationinsights";
import { randomUUID } from "crypto";
import { config, isServiceConfigured } from "../config.js";

export interface InteractionLog {
  id: string;
  userId: string;
  userName: string;
  query: string;
  response: string;
  sources: string[];
  confidenceScore: number;
  timestamp: string;
  conversationId: string;
  responseTimeMs: number;
}

export interface InteractionFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

class LoggerService {
  private cosmosContainer: Container | null = null;
  private appInsightsClient: appInsights.TelemetryClient | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize Application Insights
    if (isServiceConfigured("appInsights")) {
      try {
        appInsights
          .setup(config.appInsights.instrumentationKey)
          .setAutoDependencyCorrelation(true)
          .setAutoCollectRequests(true)
          .setAutoCollectPerformance(true, true)
          .setAutoCollectExceptions(true)
          .setAutoCollectDependencies(true)
          .setAutoCollectConsole(true, true)
          .start();

        this.appInsightsClient = appInsights.defaultClient;
        console.log("Application Insights initialized");
      } catch (error) {
        console.warn("Failed to initialize Application Insights:", error);
      }
    } else {
      console.log("Application Insights not configured, skipping");
    }

    // Initialize Cosmos DB
    if (isServiceConfigured("cosmos")) {
      try {
        const cosmosClient = new CosmosClient({
          endpoint: config.cosmos.endpoint,
          key: config.cosmos.key,
        });

        const { database } = await cosmosClient.databases.createIfNotExists({
          id: config.cosmos.database,
        });

        const { container } = await database.containers.createIfNotExists({
          id: config.cosmos.container,
          partitionKey: { paths: ["/userId"] },
        });

        this.cosmosContainer = container;
        console.log(`Cosmos DB initialized: ${config.cosmos.database}/${config.cosmos.container}`);
      } catch (error) {
        console.warn("Failed to initialize Cosmos DB:", error);
      }
    } else {
      console.log("Cosmos DB not configured, skipping");
    }

    this.initialized = true;
  }

  async logInteraction(data: Omit<InteractionLog, "id" | "timestamp">): Promise<InteractionLog> {
    const log: InteractionLog = {
      ...data,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    // Log to Application Insights
    if (this.appInsightsClient) {
      try {
        this.appInsightsClient.trackEvent({
          name: "CopilotInteraction",
          properties: {
            userId: log.userId,
            userName: log.userName,
            query: log.query,
            response: log.response.substring(0, 1000), // Truncate for telemetry
            sources: JSON.stringify(log.sources),
            confidenceScore: String(log.confidenceScore),
            conversationId: log.conversationId,
            responseTimeMs: String(log.responseTimeMs),
          },
        });
        this.appInsightsClient.trackMetric({
          name: "CopilotResponseTime",
          value: log.responseTimeMs,
        });
        this.appInsightsClient.trackMetric({
          name: "CopilotConfidenceScore",
          value: log.confidenceScore,
        });
      } catch (error) {
        console.warn("Failed to log to Application Insights:", error);
      }
    }

    // Log to Cosmos DB
    if (this.cosmosContainer) {
      try {
        await this.cosmosContainer.items.create(log);
      } catch (error) {
        console.warn("Failed to log to Cosmos DB:", error);
      }
    }

    // Always log to console as fallback
    if (!this.appInsightsClient && !this.cosmosContainer) {
      console.log("[InteractionLog]", JSON.stringify(log, null, 2));
    }

    return log;
  }

  async getInteractions(filters?: InteractionFilters): Promise<InteractionLog[]> {
    if (!this.cosmosContainer) {
      console.warn("Cosmos DB not available, cannot retrieve interactions");
      return [];
    }

    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: string }> = [];

    if (filters?.userId) {
      conditions.push("c.userId = @userId");
      parameters.push({ name: "@userId", value: filters.userId });
    }

    if (filters?.startDate) {
      conditions.push("c.timestamp >= @startDate");
      parameters.push({ name: "@startDate", value: filters.startDate });
    }

    if (filters?.endDate) {
      conditions.push("c.timestamp <= @endDate");
      parameters.push({ name: "@endDate", value: filters.endDate });
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const querySpec = {
      query: `SELECT * FROM c ${whereClause} ORDER BY c.timestamp DESC`,
      parameters,
    };

    const { resources } = await this.cosmosContainer.items.query<InteractionLog>(querySpec).fetchAll();
    return resources;
  }

  createInteractionId(): string {
    return randomUUID();
  }
}

export const loggerService = new LoggerService();
