#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Status Line v10 - API Response Time Tracker
Display: [Model] ⚡ 1.5s API | 45s total | $0.12
Color code API time: green < 1s, yellow < 3s, red > 3s
"""

import json
import sys


# ANSI color codes
FG_GREEN = "\033[32m"
FG_YELLOW = "\033[33m"
FG_RED = "\033[31m"
FG_CYAN = "\033[36m"
FG_WHITE = "\033[97m"
FG_MAGENTA = "\033[35m"
BOLD = "\033[1m"
RESET = "\033[0m"


def format_duration(ms):
    """Format milliseconds to human-readable duration."""
    if ms is None or ms == 0:
        return "0s"

    seconds = ms / 1000
    if seconds < 60:
        return f"{seconds:.1f}s"

    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}m {remaining_seconds:.0f}s"


def get_api_time_color(api_ms):
    """Get color based on API response time."""
    if api_ms is None:
        return FG_WHITE

    seconds = api_ms / 1000
    if seconds < 1:
        return FG_GREEN
    elif seconds < 3:
        return FG_YELLOW
    else:
        return FG_RED


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


def generate_status_line(input_data):
    """Generate the API response time tracker status line."""
    # Get model name
    model_info = input_data.get("model", {})
    model_name = model_info.get("display_name", "Claude")

    # Get cost info
    cost_data = input_data.get("cost", {})
    total_cost = cost_data.get("total_cost_usd", 0) or 0
    total_duration_ms = cost_data.get("total_duration_ms", 0) or 0
    api_duration_ms = cost_data.get("total_api_duration_ms", 0) or 0

    # Format durations
    api_time_str = format_duration(api_duration_ms)
    total_time_str = format_duration(total_duration_ms)

    # Get color for API time
    api_color = get_api_time_color(api_duration_ms)

    # Format cost
    cost_str = format_cost(total_cost)

    # Build status line
    # [Model] ⚡ 1.5s API | 45s total | $0.12
    status = (
        f"{FG_CYAN}{BOLD}[{model_name}]{RESET} "
        f"{api_color}⚡ {api_time_str} API{RESET} | "
        f"{FG_WHITE}{total_time_str} total{RESET} | "
        f"{FG_MAGENTA}{cost_str}{RESET}"
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
