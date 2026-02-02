#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Status Line v12 - Multi-Segment Emoji Style
Display: [robot] Opus | [folder] project | [herb] main | [money] $0.12 | [chart] 42%
Clean colorful design with emoji separators
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


def shorten_path(path, max_length=15):
    """Shorten a path for display, returning just the directory name."""
    if not path:
        return "~"

    # Get just the last directory name
    return os.path.basename(path) or "~"


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


def get_usage_color(percentage):
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
    """Generate the multi-segment emoji style status line."""
    # Get model name
    model_info = input_data.get("model", {})
    model_name = model_info.get("display_name", "Claude")

    # Get workspace info
    workspace = input_data.get("workspace", {})
    project_dir = workspace.get("project_dir", os.getcwd())
    project_name = shorten_path(project_dir)

    # Get git branch
    git_branch = get_git_branch()

    # Get cost info
    cost_data = input_data.get("cost", {})
    total_cost = cost_data.get("total_cost_usd", 0) or 0

    # Get context usage
    context_data = input_data.get("context_window", {})
    used_percentage = context_data.get("used_percentage", 0) or 0

    # Format values
    cost_str = format_cost(total_cost)
    usage_color = get_usage_color(used_percentage)

    # Build segments
    segments = []

    # Model segment
    segments.append(f"\U0001F916 {FG_CYAN}{BOLD}{model_name}{RESET}")

    # Project segment
    segments.append(f"\U0001F4C1 {FG_BLUE}{project_name}{RESET}")

    # Git branch segment (if available)
    if git_branch:
        segments.append(f"\U0001F33F {FG_GREEN}{git_branch}{RESET}")

    # Cost segment
    segments.append(f"\U0001F4B0 {FG_MAGENTA}{cost_str}{RESET}")

    # Context usage segment
    segments.append(f"\U0001F4CA {usage_color}{used_percentage:.0f}%{RESET}")

    # Join with dim separators
    separator = f" {DIM}|{RESET} "
    status = separator.join(segments)

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
