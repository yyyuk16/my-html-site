import json
import openai  # or Gemini API

openai.api_key = "YOUR_API_KEY"

input_path = "tuberculosis_prompt.jsonl"
output_path = "generated_quizzes.jsonl"

with open(input_path, "r", encoding="utf-8") as infile, open(output_path, "w", encoding="utf-8") as outfile:
    for line in infile:
        item = json.loads(line)
        prompt = item["prompt"]

        response = openai.ChatCompletion.create(
            model="gpt-4",  # または gpt-3.5-turbo など
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        quiz_text = response["choices"][0]["message"]["content"]
        json.dump({"prompt": prompt, "quiz": quiz_text}, outfile, ensure_ascii=False)
        outfile.write("\n")
