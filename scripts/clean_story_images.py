import json
## Originally used to removed old images. They were used in the previous version of this app.
## DO NOT RUN AGAIN.
def update_story_images_in_place(json_path):
    with open(json_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    data = data['covarnius']
    if "story" in data and isinstance(data["story"], list):
        for page in data["story"]:
            if "image" in page and not page["image"].startswith("covarnius"):
                page["image"] = ""

        with open(json_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        print(f"Updated JSON saved to: {json_path}")
    else:
        raise ValueError("'story' field not found or is not a list")

# Example usage
if __name__ == "__main__":
    raise ValueError("Are you sure you want to run this? It will remove all the images.")
    update_story_images_in_place("../stories/stories-jp.json")  # Replace with actual path if different
