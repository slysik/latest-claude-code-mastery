#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Status Line v14 - Activity Pulse with Progress Bar
Display: [Opus] * Active | 42% ████░░░░ | $0.12 | 0m 45s
Progress bar for context, session duration timer
"""

import json
import sys


# ANSI color codes
FG_GREEN = "\033[32m"
FG_YELLOW = "\033[33m"
FG_CYAN = "\033[36m"
FG_MAGENTA = "\033[35m"
FG_WHITE = "\033[97m"
FG_RED = "\033[31m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Progress bar characters
BAR_FILLED = "\u2588"  # Full block
BAR_EMPTY = "\u2591"   # Light shade


def format_duration(ms):
    """Format milliseconds to human-readable duration."""
    if ms is None or ms == 0:
        return "0m 0s"

    total_seconds = ms / 1000
    minutes = int(total_seconds // 60)
    seconds = int(total_seconds % 60)

    if minutes > 0:
        return f"{minutes}m {seconds}s"
    else:
        return f"0m {seconds}s"


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


def get_progress_bar(percentage, width=8):
    """Generate a progress bar for context usage."""
    if percentage <= 0:
        return BAR_EMPTY * width

    filled_count = int((percentage / 100) * width)
    filled_count = max(0, min(width, filled_count))
    empty_count = width - filled_count

    return BAR_FILLED * filled_count + BAR_EMPTY * empty_count


def get_progress_color(percentage):
    """Get color based on context usage percentage."""
    if percentage < 50:
        return FG_GREEN
    elif percentage < 75:
        return FG_YELLOW
    elif percentage < 90:
        return FG_MAGENTA
    else:
        return FG_RED


def get_activity_indicator():
    """Get a pulsing activity indicator."""
    # Simple active indicator (could be enhanced with animation)
    return f"{FG_GREEN}\u25cf{RESET}"  # Filled circle


def generate_status_line(input_data):
    """Generate the activity pulse with progress bar status line."""
    # Get model name
    model_info = input_data.get("model", {})
    model_name = model_info.get("display_name", "Claude")

    # Get cost info
    cost_data = input_data.get("cost", {})
    total_cost = cost_data.get("total_cost_usd", 0) or 0
    total_duration_ms = cost_data.get("total_duration_ms", 0) or 0

    # Get context usage
    context_data = input_data.get("context_window", {})
    used_percentage = context_data.get("used_percentage", 0) or 0

    # Generate progress bar
    progress_bar = get_progress_bar(used_percentage)
    progress_color = get_progress_color(used_percentage)

    # Format values
    cost_str = format_cost(total_cost)
    duration_str = format_duration(total_duration_ms)
    activity = get_activity_indicator()

    # Build status line
    # [Opus] * Active | 42% ████░░░░ | $0.12 | 0m 45s
    status = (
        f"{FG_CYAN}{BOLD}[{model_name}]{RESET} "
        f"{activity} {FG_WHITE}Active{RESET} | "
        f"{progress_color}{used_percentage:.0f}% {progress_bar}{RESET} | "
        f"{FG_MAGENTA}{cost_str}{RESET} | "
        f"{DIM}{duration_str}{RESET}"
    )

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
