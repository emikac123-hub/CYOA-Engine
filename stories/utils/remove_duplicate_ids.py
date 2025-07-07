import json
import os

# General Notes
# I had to break up the different languages to fit onto the screen. 
# Language	File	Continuation Pages Added
# German	stories-de.json	144
# Spanish	stories-es.json	113
# French	stories-fr.json	158
# Icelandic	stories-is.json	107
# Japanese	stories-jp.json	1
# Japanese is the most concise language
"""
    Remove Duplicates from the stories. This probably happened when I was bringing them over from Swift UI and lost track.
"""
# List of translation files
file_names = [
    "stories-en.json",
    "stories-de.json",
    "stories-es.json",
    "stories-fr.json",
    "stories-is.json",
    "stories-jp.json"
]

# Input/output folders
input_dir = "../"
output_dir = "./cleaned_stories"
os.makedirs(output_dir, exist_ok=True)

# Keep track of removed IDs
removed_ids_report = {}

for file_name in file_names:
    input_path = os.path.join(input_dir, file_name)
    output_path = os.path.join(output_dir, file_name)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        story = data.get("story", [])
        seen_ids = set()
        cleaned_story = []
        removed_ids = []

        for page in story:
            page_id = page.get("id")
            if page_id in seen_ids:
                removed_ids.append(page_id)
            else:
                seen_ids.add(page_id)
                cleaned_story.append(page)

        data["story"] = cleaned_story

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        removed_ids_report[file_name] = removed_ids

    except Exception as e:
        removed_ids_report[file_name] = [f"Error: {str(e)}"]

# Print results
print("\n=== Duplicate ID Removal Report ===")
for file, ids in removed_ids_report.items():
    if ids:
        print(f"\n{file} - Removed {len(ids)} duplicate ID(s):")
        for id_ in ids:
            print(f"  - {id_}")
    else:
        print(f"\n{file} - ✅ No duplicates found.")
