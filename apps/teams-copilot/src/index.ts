import express, { Request, Response } from "express";
import { CloudAdapter, ConfigurationBotFrameworkAuthentication } from "botbuilder";
import path from "path";
import { readFile } from "fs/promises";
import { app, initializeBot } from "./bot.js";
import { loggerService } from "./services/logger.js";
import { config } from "./config.js";

// Create Express server
const expressApp = express();
expressApp.use(express.json());

// Create Bot Framework adapter
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
  MicrosoftAppId: config.bot.id,
  MicrosoftAppPassword: config.bot.password,
  MicrosoftAppType: config.bot.type,
});

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Error handler
adapter.onTurnError = async (context: any, error: Error) => {
  console.error(`\n[onTurnError] unhandled error: ${error}`);
  console.error(error);

  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity("Please check the bot logs for more information.");
};

// Bot messages endpoint
expressApp.post("/api/messages", async (req: Request, res: Response) => {
  await adapter.process(req, res, async (context: any) => {
    await app.run(context);
  });
});

// Logs viewer page endpoint
expressApp.get("/api/logs", async (req: Request, res: Response) => {
  try {
    const logsHtmlPath = path.join(__dirname, "pages", "logs.html");
    const htmlContent = await readFile(logsHtmlPath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving logs page:", error);
    res.status(500).send("Error loading logs page");
  }
});

// Logs data API endpoint
expressApp.get("/api/logs/data", async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const filters: any = {};
    if (userId) filters.userId = String(userId);
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);

    const interactions = await loggerService.getInteractions(filters);
    res.json(interactions);
  } catch (error) {
    console.error("Error retrieving logs:", error);
    res.status(500).json({ error: "Failed to retrieve interaction logs" });
  }
});

// Health check endpoint
expressApp.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Initialize and start server
async function startServer(): Promise<void> {
  try {
    await initializeBot();

    const port = config.server.port;
    expressApp.listen(port, () => {
      console.log(`\nServer listening on port ${port}`);
      console.log(`Bot endpoint: http://localhost:${port}/api/messages`);
      console.log(`Logs viewer: http://localhost:${port}/api/logs`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
