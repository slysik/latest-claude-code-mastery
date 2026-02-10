import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export interface Config {
  bot: {
    id: string;
    password: string;
    type: string;
  };
  azureOpenAI: {
    endpoint: string;
    apiKey: string;
    embeddingDeployment: string;
    chatDeployment: string;
    apiVersion: string;
  };
  azureSearch: {
    endpoint: string;
    apiKey: string;
    indexName: string;
  };
  graph: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    sharePointSiteId: string;
    sharePointDriveId: string;
  };
  cosmos: {
    endpoint: string;
    key: string;
    database: string;
    container: string;
  };
  appInsights: {
    instrumentationKey: string;
  };
  server: {
    port: number;
  };
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    console.warn(`Warning: Environment variable ${key} is not set`);
    return "";
  }
  return value;
}

export const config: Config = {
  bot: {
    id: getEnv("BOT_ID"),
    password: getEnv("BOT_PASSWORD"),
    type: getEnv("BOT_TYPE", "MultiTenant"),
  },
  azureOpenAI: {
    endpoint: getEnv("AZURE_OPENAI_ENDPOINT"),
    apiKey: getEnv("AZURE_OPENAI_API_KEY"),
    embeddingDeployment: getEnv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small"),
    chatDeployment: getEnv("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4o"),
    apiVersion: getEnv("AZURE_OPENAI_API_VERSION", "2024-10-21"),
  },
  azureSearch: {
    endpoint: getEnv("AZURE_SEARCH_ENDPOINT"),
    apiKey: getEnv("AZURE_SEARCH_API_KEY"),
    indexName: getEnv("AZURE_SEARCH_INDEX_NAME", "travel-policy-index"),
  },
  graph: {
    tenantId: getEnv("GRAPH_TENANT_ID"),
    clientId: getEnv("GRAPH_CLIENT_ID"),
    clientSecret: getEnv("GRAPH_CLIENT_SECRET"),
    sharePointSiteId: getEnv("SHAREPOINT_SITE_ID"),
    sharePointDriveId: getEnv("SHAREPOINT_DRIVE_ID"),
  },
  cosmos: {
    endpoint: getEnv("COSMOS_ENDPOINT"),
    key: getEnv("COSMOS_KEY"),
    database: getEnv("COSMOS_DATABASE", "copilot-logs"),
    container: getEnv("COSMOS_CONTAINER", "interactions"),
  },
  appInsights: {
    instrumentationKey: getEnv("APPINSIGHTS_INSTRUMENTATIONKEY"),
  },
  server: {
    port: parseInt(getEnv("PORT", "3978"), 10),
  },
};

export function isServiceConfigured(service: "graph" | "cosmos" | "appInsights" | "azureSearch" | "azureOpenAI"): boolean {
  switch (service) {
    case "graph":
      return !!(config.graph.tenantId && config.graph.clientId && config.graph.clientSecret);
    case "cosmos":
      return !!(config.cosmos.endpoint && config.cosmos.key);
    case "appInsights":
      return !!config.appInsights.instrumentationKey;
    case "azureSearch":
      return !!(config.azureSearch.endpoint && config.azureSearch.apiKey);
    case "azureOpenAI":
      return !!(config.azureOpenAI.endpoint && config.azureOpenAI.apiKey);
    default:
      return false;
  }
}
