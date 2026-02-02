#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Status Line v11 - Code Changes Stats
Display: [Model] +156/-23 lines | $0.12 | Style: default
Show net change with color (green for net add, red for net remove)
"""

import json
import sys


# ANSI color codes
FG_GREEN = "\033[32m"
FG_RED = "\033[31m"
FG_CYAN = "\033[36m"
FG_WHITE = "\033[97m"
FG_MAGENTA = "\033[35m"
FG_YELLOW = "\033[33m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


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
    """Generate the code changes stats status line."""
    # Get model name
    model_info = input_data.get("model", {})
    model_name = model_info.get("display_name", "Claude")

    # Get cost info
    cost_data = input_data.get("cost", {})
    total_cost = cost_data.get("total_cost_usd", 0) or 0
    lines_added = cost_data.get("total_lines_added", 0) or 0
    lines_removed = cost_data.get("total_lines_removed", 0) or 0

    # Get output style
    output_style = input_data.get("output_style", {})
    style_name = output_style.get("name", "default")

    # Calculate net change
    net_change = lines_added - lines_removed

    # Determine color based on net change
    if net_change > 0:
        net_color = FG_GREEN
        net_indicator = f"+{net_change}"
    elif net_change < 0:
        net_color = FG_RED
        net_indicator = str(net_change)
    else:
        net_color = FG_WHITE
        net_indicator = "0"

    # Format cost
    cost_str = format_cost(total_cost)

    # Build status line
    # [Model] +156/-23 lines | $0.12 | Style: default
    status = (
        f"{FG_CYAN}{BOLD}[{model_name}]{RESET} "
        f"{FG_GREEN}+{lines_added}{RESET}/"
        f"{FG_RED}-{lines_removed}{RESET} lines "
        f"{DIM}({net_color}{net_indicator}{RESET}{DIM} net){RESET} | "
        f"{FG_MAGENTA}{cost_str}{RESET} | "
        f"{FG_YELLOW}Style: {style_name}{RESET}"
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
