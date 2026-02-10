import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { readFile } from "fs/promises";
import path from "path";
import { config, isServiceConfigured } from "../config.js";

export interface DriveItem {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  webUrl: string;
}

export interface SharePointConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteId: string;
  driveId: string;
}

class SharePointService {
  private graphClient: Client | null = null;
  private msalApp: ConfidentialClientApplication | null = null;

  private async getGraphClient(): Promise<Client> {
    if (this.graphClient) return this.graphClient;

    const msalConfig: Configuration = {
      auth: {
        clientId: config.graph.clientId,
        authority: `https://login.microsoftonline.com/${config.graph.tenantId}`,
        clientSecret: config.graph.clientSecret,
      },
    };

    this.msalApp = new ConfidentialClientApplication(msalConfig);

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async (): Promise<string> => {
          const result = await this.msalApp!.acquireTokenByClientCredential({
            scopes: ["https://graph.microsoft.com/.default"],
          });
          if (!result?.accessToken) {
            throw new Error("Failed to acquire access token");
          }
          return result.accessToken;
        },
      },
    });

    return this.graphClient;
  }

  async getDocumentContent(siteId: string, driveId: string, filePath: string): Promise<string> {
    if (!isServiceConfigured("graph")) {
      console.log("SharePoint not configured, using local fallback");
      return this.getLocalFallback(filePath);
    }

    try {
      const client = await this.getGraphClient();
      const encodedPath = encodeURIComponent(filePath);
      const response = await client
        .api(`/sites/${siteId}/drives/${driveId}/root:/${encodedPath}:/content`)
        .get();

      if (typeof response === "string") {
        return response;
      }

      // Handle binary response by converting buffer to string
      if (Buffer.isBuffer(response)) {
        return response.toString("utf-8");
      }

      // Handle ReadableStream
      const chunks: Buffer[] = [];
      for await (const chunk of response) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks).toString("utf-8");
    } catch (error) {
      console.error("Error fetching from SharePoint, falling back to local:", error);
      return this.getLocalFallback(filePath);
    }
  }

  async listDocuments(siteId: string, driveId: string): Promise<DriveItem[]> {
    if (!isServiceConfigured("graph")) {
      console.log("SharePoint not configured");
      return [];
    }

    const client = await this.getGraphClient();
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/root/children`)
      .select("id,name,size,lastModifiedDateTime,webUrl")
      .get();

    return (response.value ?? []) as DriveItem[];
  }

  async getLocalFallback(filePath: string): Promise<string> {
    // Strip any directory prefixes and look in data/
    const fileName = path.basename(filePath);
    const localPath = path.resolve(__dirname, "../../data", fileName);
    try {
      return await readFile(localPath, "utf-8");
    } catch {
      // Try the exact path relative to project root
      const altPath = path.resolve(__dirname, "../..", filePath);
      return await readFile(altPath, "utf-8");
    }
  }
}

export const sharePointService = new SharePointService();
