import os
import json
import shutil
from datetime import datetime

history_dir = r"C:\Users\Meet\AppData\Roaming\Code\User\History"
out_dir = r"C:\Users\Meet\.gemini\antigravity\scratch\history_recovery"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

found_files = []

for root, dirs, files in os.walk(history_dir):
    if "entries.json" in files:
        entries_path = os.path.join(root, "entries.json")
        try:
            with open(entries_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                resource = data.get("resource", "")
                if "Services.jsx" in resource:
                    print(f"Found history for {resource} in {root}")
                    for entry in data.get("entries", []):
                        file_id = entry.get("id")
                        timestamp = entry.get("timestamp")
                        
                        source_file = os.path.join(root, file_id)
                        if os.path.exists(source_file):
                            dt = datetime.fromtimestamp(timestamp/1000.0)
                            dt_str = dt.strftime("%Y-%m-%d_%H-%M-%S")
                            out_name = f"Services_jsx_{dt_str}_{file_id}.jsx"
                            out_path = os.path.join(out_dir, out_name)
                            shutil.copy2(source_file, out_path)
                            print(f"Recovered backup: {out_name} (from {dt_str})")
        except Exception as e:
            pass

print("Recovery search complete.")
