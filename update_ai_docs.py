#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests",
#     "beautifulsoup4",
#     "markdownify",
# ]
# ///

"""
Update ai_docs directory with latest content from Anthropic's official documentation.

Usage:
    python update_ai_docs.py --page hooks
    python update_ai_docs.py --page subagents  
    python update_ai_docs.py --page slash-commands
    python update_ai_docs.py --all
"""

import requests
import sys
import json
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup
from markdownify import markdownify as md

# Documentation URL mappings
DOC_URLS = {
    "hooks": "https://docs.anthropic.com/en/docs/claude-code/hooks",
    "subagents": "https://docs.anthropic.com/en/docs/claude-code/subagents", 
    "slash-commands": "https://docs.anthropic.com/en/docs/claude-code/slash-commands",
    "output-styles": "https://docs.anthropic.com/en/docs/claude-code/output-styles",
    "quick-start": "https://docs.anthropic.com/en/docs/claude-code/quickstart",
    "memory": "https://docs.anthropic.com/en/docs/claude-code/memory",
    "settings": "https://docs.anthropic.com/en/docs/claude-code/settings",
}

# File mappings for ai_docs directory
FILE_MAPPINGS = {
    "hooks": "cc_hooks_docs.md",
    "subagents": "anthropic_docs_subagents.md", 
    "slash-commands": "anthropic_custom_slash_commands.md",
    "output-styles": "anthropic_output_styles.md",
    "quick-start": "anthropic_quick_start.md",
    "memory": "anthropic_memory_docs.md",
    "settings": "anthropic_settings_docs.md",
}

def fetch_and_convert_doc(page_name: str) -> str:
    """Fetch documentation page and convert to markdown."""
    if page_name not in DOC_URLS:
        raise ValueError(f"Unknown page: {page_name}. Available: {list(DOC_URLS.keys())}")
    
    url = DOC_URLS[page_name]
    print(f"Fetching {url}...")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to fetch {url}: {e}")
    
    # Parse HTML and extract main content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Try to find the main content area (adjust selectors as needed)
    content_selectors = [
        'main',
        '[role="main"]', 
        '.content',
        'article',
        '.documentation',
    ]
    
    content = None
    for selector in content_selectors:
        content = soup.select_one(selector)
        if content:
            break
    
    if not content:
        # Fallback to body if no main content found
        content = soup.find('body')
    
    if not content:
        raise RuntimeError("Could not extract content from the page")
    
    # Convert to markdown
    markdown_content = md(str(content))
    
    # Add header with update info
    header = f"""# {page_name.replace('-', ' ').title()}

> Updated from Anthropic's official documentation
> Source: {url}
> Last updated: {datetime.now().isoformat()}

"""
    
    return header + markdown_content

def update_ai_docs_file(page_name: str, content: str) -> bool:
    """Update the corresponding file in ai_docs directory."""
    if page_name not in FILE_MAPPINGS:
        print(f"No file mapping for {page_name}, skipping...")
        return False
    
    ai_docs_dir = Path("ai_docs")
    ai_docs_dir.mkdir(exist_ok=True)
    
    file_path = ai_docs_dir / FILE_MAPPINGS[page_name]
    
    try:
        # Backup existing file
        if file_path.exists():
            backup_path = file_path.with_suffix(f'.backup-{datetime.now().strftime("%Y%m%d-%H%M%S")}.md')
            file_path.rename(backup_path)
            print(f"Backed up existing file to {backup_path}")
        
        # Write new content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated {file_path}")
        return True
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return False

def main():
    """Main function to handle command line arguments."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Update ai_docs with latest Anthropic documentation")
    parser.add_argument("--page", help="Specific page to update", choices=list(DOC_URLS.keys()))
    parser.add_argument("--all", action="store_true", help="Update all documentation pages")
    parser.add_argument("--list", action="store_true", help="List available pages")
    
    args = parser.parse_args()
    
    if args.list:
        print("Available documentation pages:")
        for page, url in DOC_URLS.items():
            print(f"  {page:15} -> {url}")
        return
    
    if not args.page and not args.all:
        parser.print_help()
        return
    
    pages_to_update = list(DOC_URLS.keys()) if args.all else [args.page]
    
    success_count = 0
    total_count = len(pages_to_update)
    
    for page in pages_to_update:
        try:
            print(f"\n--- Updating {page} ---")
            content = fetch_and_convert_doc(page)
            if update_ai_docs_file(page, content):
                success_count += 1
        except Exception as e:
            print(f"Failed to update {page}: {e}")
    
    print(f"\n--- Summary ---")
    print(f"Successfully updated: {success_count}/{total_count} pages")
    
    if success_count < total_count:
        sys.exit(1)

if __name__ == "__main__":
    main()