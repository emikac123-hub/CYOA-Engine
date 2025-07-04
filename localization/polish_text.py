from openai import OpenAI
import json

# Initialize OpenAI client
client = OpenAI(api_key="sk")  # Replace with your actual key

# Values to skip polishing (can be expanded)
SKIP_TEXTS = {"次へ", "Continue", "続く"}

# Polish a single text passage using GPT
def polish_text(text, language):
    prompt = f"""
You are a professional {language} writer. Polish the following story passage so that it sounds natural and native-level fluent in {language}. 
Preserve the meaning and tone. Do not translate literally. Only return the revised passage in {language}.

---

{text}

---
"""
    print(f"Sending to GPT: {text[:60]}...")
    response = client.chat.completions.create(
        model="gpt-4",  # or "gpt-3.5-turbo"
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

# Recursively polish all "text" fields except skip list
def polish_text_fields(obj, language):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == "text" and isinstance(value, str):
                if value.strip() in SKIP_TEXTS:
                    print(f"Skipping: {value}")
                    continue
                obj[key] = polish_text(value, language)
            else:
                polish_text_fields(value, language)
    elif isinstance(obj, list):
        for item in obj:
            polish_text_fields(item, language)

# File paths
input_path = "../stories/covarnius-jp.json"
output_path = "polished-covarnius-jp.json"

# Load JSON input
with open(input_path, "r", encoding="utf-8") as infile:
    data = json.load(infile)

# Polish applicable "text" values
polish_text_fields(data, "Japanese")

# Save result
with open(output_path, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=2)

print(f"\n✅ Polished file saved to: {output_path}")
