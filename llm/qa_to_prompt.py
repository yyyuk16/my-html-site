import json

input_path = "tuberculosis_qa.jsonl"
output_path = "tuberculosis_prompt.jsonl"

with open(input_path, "r", encoding="utf-8") as infile, open(output_path, "w", encoding="utf-8") as outfile:
    for line in infile:
        item = json.loads(line)
        question = item["question"]
        answer = item["answer"]

        prompt = (
            f"次の医療知識をもとに、4択のクイズを作成してください。\n"
            f"【知識】{question} → {answer}\n"
            f"【出力形式】\n"
            f"Q: <問題文>\n"
            f"A. <選択肢1>\n"
            f"B. <選択肢2>\n"
            f"C. <選択肢3>\n"
            f"D. <選択肢4>\n"
            f"正解: <A〜Dのどれか>\n"
        )
        json.dump({"prompt": prompt}, outfile, ensure_ascii=False)
        outfile.write("\n")
