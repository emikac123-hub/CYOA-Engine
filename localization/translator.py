import json

from deep_translator import GoogleTranslator

# Load your JSON file
input_file = "../stories/stories-en.json"  # Replace with your actual file name
output_file = "covarnius_texts_translated_to_japanse.json"
target_language = 'ja'
# Recursive function to translate all "text" fields
def translate_text_fields(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == "text" and isinstance(value, str):
                try:
                    print(f"begininng translation...")
                    obj[key] = GoogleTranslator(source='auto', target=target_language).translate(value)
                    print(f"finished translation...{obj[key]}")
                except Exception as e:
                    print(f"Error translating: {value}\n{e}")
            else:
                translate_text_fields(value)
    elif isinstance(obj, list):
        for item in obj:
            translate_text_fields(item)

# Parse file content (even if it's a sequence of objects)
with open(input_file, "r", encoding="utf-8") as f:
    raw = f.read()

# Try to fix malformed JSON by wrapping it into an array
if not raw.strip().startswith("["):
    raw = "[" + raw.strip().rstrip(",") + "]"

# Parse and translate
data = json.loads(raw)
translate_text_fields(data)

# Save to new JSON file
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Translation complete. Output saved to: {output_file}")
