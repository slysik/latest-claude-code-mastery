#!/bin/bash

# Claude Code Project Setup Script
# This script copies your Claude Code configuration to a new project directory

if [ $# -ne 1 ]; then
    echo "Usage: $0 <new_project_path>"
    echo "Example: $0 /path/to/new/project"
    exit 1
fi

NEW_PROJECT_PATH="$1"
SOURCE_CLAUDE_DIR="/Users/slysik/Downloads/PDF/claude-code-hooks-mastery/.claude"

# Create the new project directory if it doesn't exist
mkdir -p "$NEW_PROJECT_PATH"

# Create .claude directory in new project
mkdir -p "$NEW_PROJECT_PATH/.claude"

echo "Setting up Claude Code configuration for: $NEW_PROJECT_PATH"

# Copy core configuration
cp "$SOURCE_CLAUDE_DIR/settings.json" "$NEW_PROJECT_PATH/.claude/"
echo "✓ Copied settings.json"

# Copy hooks
if [ -d "$SOURCE_CLAUDE_DIR/hooks" ]; then
    cp -r "$SOURCE_CLAUDE_DIR/hooks" "$NEW_PROJECT_PATH/.claude/"
    echo "✓ Copied hooks directory"
fi

# Copy status lines
if [ -d "$SOURCE_CLAUDE_DIR/status_lines" ]; then
    cp -r "$SOURCE_CLAUDE_DIR/status_lines" "$NEW_PROJECT_PATH/.claude/"
    echo "✓ Copied status_lines directory"
fi

# Copy agents (optional - comment out if you don't want project-specific agents)
if [ -d "$SOURCE_CLAUDE_DIR/agents" ]; then
    cp -r "$SOURCE_CLAUDE_DIR/agents" "$NEW_PROJECT_PATH/.claude/"
    echo "✓ Copied agents directory"
fi

# Copy commands (optional)
if [ -d "$SOURCE_CLAUDE_DIR/commands" ]; then
    cp -r "$SOURCE_CLAUDE_DIR/commands" "$NEW_PROJECT_PATH/.claude/"
    echo "✓ Copied commands directory"
fi

# Copy output styles (optional)
if [ -d "$SOURCE_CLAUDE_DIR/output-styles" ]; then
    cp -r "$SOURCE_CLAUDE_DIR/output-styles" "$NEW_PROJECT_PATH/.claude/"
    echo "✓ Copied output-styles directory"
fi

# Don't copy data directory (session-specific)
echo "✓ Setup complete!"
echo ""
echo "Your new project now has:"
echo "  • All hooks configured"
echo "  • Status line setup"
echo "  • Custom agents and commands"
echo "  • Output styles"
echo ""
echo "To test, navigate to $NEW_PROJECT_PATH and run: claude"