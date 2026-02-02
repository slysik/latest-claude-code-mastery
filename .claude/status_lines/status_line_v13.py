#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Status Line v13 - Compact Sparkline
Display: [Opus] dir branch ▁▂▃▅▇ $0.12
Use Unicode block characters for context usage visualization
"""

import json
import sys
import os
import subprocess
from pathlib import Path


# ANSI color codes
FG_GREEN = "\033[32m"
FG_YELLOW = "\033[33m"
FG_CYAN = "\033[36m"
FG_MAGENTA = "\033[35m"
FG_BLUE = "\033[34m"
FG_WHITE = "\033[97m"
FG_RED = "\033[31m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Unicode block characters for sparkline (increasing height)
BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]


def get_git_branch():
    """Get the current git branch name."""
    try:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True,
            text=True,
            timeout=1
        )
        if result.returncode == 0:
            branch = result.stdout.strip()
            if branch:
                return branch
    except Exception:
        pass

    # Fallback: try reading .git/HEAD
    try:
        git_head = Path(".git/HEAD")
        if git_head.exists():
            content = git_head.read_text().strip()
            if content.startswith("ref: refs/heads/"):
                return content.replace("ref: refs/heads/", "")
    except Exception:
        pass

    return None


def shorten_path(path, max_length=12):
    """Shorten a path for display, returning just the directory name."""
    if not path:
        return "~"

    name = os.path.basename(path) or "~"
    if len(name) > max_length:
        return name[:max_length-2] + ".."
    return name


def format_cost(cost):
    """Format cost to display string."""
    if cost is None or cost == 0:
        return "$0.00"
    elif cost < 0.01:
        return f"${cost:.4f}"
    elif cost < 1:
        return f"${cost:.2f}"
    else:
        return f"${cost:.2f}"


def get_sparkline(percentage, width=5):
    """Generate a sparkline visualization for context usage.

    Shows a growing bar graph based on percentage.
    """
    if percentage <= 0:
        return BLOCKS[0] * width

    # Calculate how many blocks should be "filled" based on percentage
    filled_count = int((percentage / 100) * width)
    filled_count = max(0, min(width, filled_count))

    # Generate the sparkline with increasing block heights
    sparkline = ""
    for i in range(width):
        if i < filled_count:
            # Calculate block height based on position (creates rising effect)
            block_idx = min(len(BLOCKS) - 1, int((i + 1) / width * len(BLOCKS)))
            sparkline += BLOCKS[block_idx]
        else:
            sparkline += BLOCKS[0]  # Lowest block for unfilled

    return sparkline


def get_sparkline_color(percentage):
    """Get color based on context usage percentage."""
    if percentage < 50:
        return FG_GREEN
    elif percentage < 75:
        return FG_YELLOW
    elif percentage < 90:
        return FG_MAGENTA
    else:
        return FG_RED


def generate_status_line(input_data):
    """Generate the compact sparkline status line."""
    # Get model name
    model_info = input_data.get("model", {})
    model_name = model_info.get("display_name", "Claude")

    # Get workspace info
    workspace = input_data.get("workspace", {})
    project_dir = workspace.get("project_dir", os.getcwd())
    dir_name = shorten_path(project_dir)

    # Get git branch
    git_branch = get_git_branch()

    # Get cost info
    cost_data = input_data.get("cost", {})
    total_cost = cost_data.get("total_cost_usd", 0) or 0

    # Get context usage
    context_data = input_data.get("context_window", {})
    used_percentage = context_data.get("used_percentage", 0) or 0

    # Generate sparkline
    sparkline = get_sparkline(used_percentage)
    sparkline_color = get_sparkline_color(used_percentage)

    # Format cost
    cost_str = format_cost(total_cost)

    # Build compact status line
    # [Opus] dir branch ▁▂▃▅▇ $0.12
    parts = [f"{FG_CYAN}{BOLD}[{model_name}]{RESET}"]
    parts.append(f"{FG_BLUE}{dir_name}{RESET}")

    if git_branch:
        branch_short = git_branch[:10] + ".." if len(git_branch) > 12 else git_branch
        parts.append(f"{FG_GREEN}{branch_short}{RESET}")

    parts.append(f"{sparkline_color}{sparkline}{RESET}")
    parts.append(f"{FG_MAGENTA}{cost_str}{RESET}")

    status = " ".join(parts)

    return status


def main():
    try:
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())

        # Generate status line
        status_line = generate_status_line(input_data)

        # Output the status line
        print(status_line)

        # Success
        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        print(f"{FG_RED}[Error] Invalid JSON input{RESET}")
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        print(f"{FG_RED}[Error] Status line failed{RESET}")
        sys.exit(0)


if __name__ == "__main__":
    main()
