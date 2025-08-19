#!/usr/bin/env python3
"""Test utility to demonstrate Claude Code's file suggestion feature."""

import os
from pathlib import Path
from typing import Dict

def list_claude_configs() -> Dict[str, int]:
    """
    Scan ~/.claude/ subdirectories and count configuration files.
    
    Returns:
        Dictionary with counts of each configuration type
        Example: {'agents': 4, 'commands': 12, 'output-styles': 8}
    """
    claude_dir = Path.home() / ".claude"
    config_counts = {}
    
    # Define directories to scan and their expected file extensions
    directories = {
        'agents': ['.md'],
        'commands': ['.md'],
        'output-styles': ['.md'],
        'hooks': ['.py', '.js', '.sh'],
        'status_lines': ['.py']
    }
    
    for dir_name, extensions in directories.items():
        dir_path = claude_dir / dir_name
        if dir_path.exists() and dir_path.is_dir():
            # Count files with matching extensions (including subdirectories)
            count = sum(1 for file in dir_path.rglob('*') 
                       if file.is_file() and file.suffix in extensions)
            config_counts[dir_name] = count
        else:
            config_counts[dir_name] = 0
    
    return config_counts


def main():
    """Display Claude configuration file counts."""
    configs = list_claude_configs()
    
    print("Claude Code Configuration Files:")
    print("=" * 40)
    for category, count in configs.items():
        print(f"{category:15} : {count:3} files")
    print("=" * 40)
    print(f"Total: {sum(configs.values())} configuration files")


if __name__ == "__main__":
    main()