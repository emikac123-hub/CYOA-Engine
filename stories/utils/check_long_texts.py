import json
import os

# List of translation files
file_names = [
    "stories-en.json",
    "stories-de.json",
    "stories-es.json",
    "stories-fr.json",
    "stories-is.json",
    "stories-jp.json"
]

# Directory containing your story files
input_dir = "./"
CHAR_LIMIT = 450

print(f"\n🔍 Checking for text fields over {CHAR_LIMIT} characters...\n")

# Store report
long_texts_report = {}

for file_name in file_names:
    file_path = os.path.join(input_dir, file_name)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        story = data.get("story", [])
        long_entries = []

        for page in story:
            text = page.get("text", "")
            if len(text.strip()) > CHAR_LIMIT:
                long_entries.append({
                    "id": page.get("id"),
                    "length": len(text.strip())
                })

        long_texts_report[file_name] = long_entries

    except Exception as e:
        long_texts_report[file_name] = [{"error": str(e)}]

# Print results
for file, entries in long_texts_report.items():
    if not entries:
        print(f"{file} - ✅ All text entries are within limit.")
    elif "error" in entries[0]:
        print(f"{file} - ❌ Error: {entries[0]['error']}")
    else:
        print(f"{file} - ⚠️ {len(entries)} over-length entries found:")
        for entry in entries:
            print(f"  - ID: {entry['id']} ({entry['length']} characters)")

print("\n✅ Done.")
