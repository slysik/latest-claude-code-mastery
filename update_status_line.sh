#!/bin/bash

# update_status_line.sh - Update Claude Code session status line data
# Usage: ./update_status_line.sh <session_id> <key> <value>

set -e

# Check arguments
if [ $# -lt 3 ]; then
    echo "Usage: $0 <session_id> <key> <value>"
    echo "Example: $0 abc123-def456 project myapp"
    echo "Example: $0 abc123-def456 status 'in progress'"
    exit 1
fi

SESSION_ID="$1"
KEY="$2"
shift 2
VALUE="$*"  # Capture all remaining arguments as the value

SESSION_FILE=".claude/data/sessions/${SESSION_ID}.json"

# Check if session file exists
if [ ! -f "$SESSION_FILE" ]; then
    echo "Error: Session file not found at $SESSION_FILE"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Install it with: brew install jq"
    exit 1
fi

# Get previous value if it exists
PREVIOUS_VALUE=$(jq -r ".extras.\"$KEY\" // null" "$SESSION_FILE")

# Update the JSON file
if [ "$PREVIOUS_VALUE" = "null" ]; then
    # Add new key to extras (create extras if it doesn't exist)
    jq ".extras = (.extras // {}) | .extras.\"$KEY\" = \"$VALUE\"" "$SESSION_FILE" > "${SESSION_FILE}.tmp"
    PREVIOUS_MSG="(new key)"
else
    # Update existing key
    jq ".extras.\"$KEY\" = \"$VALUE\"" "$SESSION_FILE" > "${SESSION_FILE}.tmp"
    PREVIOUS_MSG="$PREVIOUS_VALUE"
fi

# Move temp file back to original
mv "${SESSION_FILE}.tmp" "$SESSION_FILE"

# Report success
echo "✓ Session Updated Successfully"
echo "  Session ID: $SESSION_ID"
echo "  Key Modified: $KEY"
echo "  Previous Value: $PREVIOUS_MSG"
echo "  New Value: $VALUE"
echo "  File Path: $(pwd)/$SESSION_FILE"