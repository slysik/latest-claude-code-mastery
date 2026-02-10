import { shortenCommand } from "./commands/shorten";
import { resolveCommand } from "./commands/resolve";
import { listCommand } from "./commands/list";
import { deleteCommand } from "./commands/delete";
import { statsCommand } from "./commands/stats";
import { formatError } from "./utils/formatter";

function showHelp(): void {
  console.log(`Usage: bun run src/index.ts <command> [argument]

Commands:
  shorten <url>        Shorten a URL and get a short code
  resolve <shortCode>  Resolve a short code to its original URL
  list                 List all shortened URLs
  delete <shortCode>   Delete a shortened URL by its short code
  stats                Show usage statistics
  help                 Show this help message

Examples:
  bun run src/index.ts shorten https://example.com
  bun run src/index.ts resolve abc123
  bun run src/index.ts list
  bun run src/index.ts delete abc123
  bun run src/index.ts stats`);
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const argument = process.argv[3];

  switch (command) {
    case "shorten": {
      if (!argument) {
        console.error(formatError("Please provide a URL to shorten."));
        process.exit(1);
      }
      await shortenCommand(argument);
      break;
    }

    case "resolve": {
      if (!argument) {
        console.error(formatError("Please provide a short code to resolve."));
        process.exit(1);
      }
      await resolveCommand(argument);
      break;
    }

    case "list": {
      await listCommand();
      break;
    }

    case "delete": {
      if (!argument) {
        console.error(formatError("Please provide a short code to delete."));
        process.exit(1);
      }
      await deleteCommand(argument);
      break;
    }

    case "stats": {
      await statsCommand();
      break;
    }

    case "help":
    case "--help":
    case "-h": {
      showHelp();
      break;
    }

    default: {
      if (command) {
        console.error(formatError(`Unknown command "${command}".`));
      }
      showHelp();
      process.exit(command ? 1 : 0);
      break;
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(formatError(message));
  process.exit(1);
});
