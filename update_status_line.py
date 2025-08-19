#!/usr/bin/env python3
import json
import sys
import os
from pathlib import Path

def update_status_line(session_id, key, value):
    """Update or add a key-value pair to a session's extras object."""
    
    # Construct the path to the session file
    session_file = Path(f".claude/data/sessions/{session_id}.json")
    
    # Check if the session file exists
    if not session_file.exists():
        print(f"Error: Session file not found at {session_file}")
        return False
    
    # Read the current session data
    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error reading JSON from {session_file}: {e}")
        return False
    
    # Initialize extras object if it doesn't exist
    if 'extras' not in session_data:
        session_data['extras'] = {}
        previous_value = None
    else:
        previous_value = session_data['extras'].get(key)
    
    # Update the key-value pair
    session_data['extras'][key] = value
    
    # Write the updated JSON back to the file
    try:
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
    except Exception as e:
        print(f"Error writing to {session_file}: {e}")
        return False
    
    # Report the update
    print(f"✓ Session Updated Successfully")
    print(f"  Session ID: {session_id}")
    print(f"  Key Modified: {key}")
    if previous_value is not None:
        print(f"  Previous Value: {previous_value}")
    else:
        print(f"  Previous Value: (new key)")
    print(f"  New Value: {value}")
    print(f"  File Path: {session_file.absolute()}")
    
    return True

if __name__ == "__main__":
    # Parse command-line arguments
    if len(sys.argv) < 4:
        print("Usage: update_status_line.py <session_id> <key> <value>")
        print("Example: update_status_line.py abc123 project myapp")
        
        # Run demo if no arguments provided
        print("\nRunning demo with sample data...")
        session_id = "cfd0d914-68e1-4b16-8033-82d0576e1625"
        updates = [
            ("project", "claude-code-hooks-mastery"),
            ("status", "active"),
            ("mode", "learning"),
            ("timestamp", "2025-08-19T09:50:00Z")
        ]
        
        print("Updating session status line data...")
        print("-" * 50)
        
        for key, value in updates:
            update_status_line(session_id, key, value)
            print()
    else:
        session_id = sys.argv[1]
        key = sys.argv[2]
        value = " ".join(sys.argv[3:])  # Join remaining args for multi-word values
        
        update_status_line(session_id, key, value)