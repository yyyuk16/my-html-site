import json
import re

input_path = "generated_quizzes.jsonl"
output_path = "formatted_quizzes.jsonl"

def parse_quiz(text):
    lines = text.strip().split("\n")
    q = re.search(r"Q[:：](.*)", text)
    choices = re.findall(r"[A-Da-d][.．](.*)", text)
    answer = re.search(r"正解[:：]\s*([A-Da-d])", text)

    return {
        "question": q.group(1).strip() if q else "",
        "choices": [c.strip() for c in choices],
        "correct": answer.group(1).upper() if answer else ""
    }

with open(input_path, "r", encoding="utf-8") as infile, open(output_path, "w", encoding="utf-8") as outfile:
    for line in infile:
        item = json.loads(line)
        quiz_text = item["quiz"]
        parsed = parse_quiz(quiz_text)

        json.dump(parsed, outfile, ensure_ascii=False)
        outfile.write("\n")
