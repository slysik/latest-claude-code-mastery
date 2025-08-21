#!/bin/bash

# Switch to the enhanced v85 statusline with cost and context tracking

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATUSLINE_V85="$SCRIPT_DIR/.claude/status_lines/status_line_v85.py"

if [ ! -f "$STATUSLINE_V85" ]; then
    echo "Error: status_line_v85.py not found at $STATUSLINE_V85"
    exit 1
fi

# Make sure it's executable
chmod +x "$STATUSLINE_V85"

# Update Claude Code settings to use the new statusline
echo "Switching to v85 statusline with cost and context tracking..."

# If using Claude Code CLI, you would typically update your settings like this:
# For now, just show the command that would be used
echo ""
echo "To activate this statusline, run:"
echo "claude config set status-line-script '$STATUSLINE_V85'"
echo ""
echo "Or add this to your Claude settings:"
echo "{\"status_line_script\": \"$STATUSLINE_V85\"}"
echo ""
echo "The v85 statusline includes:"
echo "  💰 Cost tracking (shows cost in ¢ or $ + duration)"
echo "  📊 Context size (attempts to show token usage or version)"
echo "  🎯 Optimized layout for better information density"