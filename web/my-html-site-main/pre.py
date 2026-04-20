# ライブラリのインストール（Colabでは最初に必要）
!pip install transformers sentencepiece

# 必要なライブラリのインポート
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# ===============================
# ① モデルとトークナイザーの読み込み
# ===============================
# ※ ここは自分のファインチューニング済みモデルのパスに変更
model_path = "./finetuned_japanese_gpt2"

# トークナイザーとモデルのロード
tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False)
model = AutoModelForCausalLM.from_pretrained(model_path)

# ===============================
# ② クイズ生成用プロンプト
# ===============================
prompt_template = """以下の形式で1問の4択クイズを作ってください。

Q: {topic}に関する4択問題を作ってください。
A1: （正解の選択肢）
A2: （不正解の選択肢）
A3: （不正解の選択肢）
A4: （不正解の選択肢）
正解: A1

Q:"""

# ===============================
# ③ クイズ生成関数
# ===============================
def generate_quiz(topic, max_length=200):
    prompt = prompt_template.format(topic=topic)
    input_ids = tokenizer.encode(prompt, return_tensors="pt")
    with torch.no_grad():
        output = model.generate(
            input_ids,
            max_length=max_length,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            temperature=0.9,
            num_return_sequences=1
        )
    result = tokenizer.decode(output[0], skip_special_tokens=True)
    # プロンプト部分を除外して表示しやすく
    generated_quiz = result.replace(prompt, "").strip()
    return f"{prompt}{generated_quiz}"

# ===============================
# ④ 実行（例：結核の感染経路）
# ===============================
topic = "結核の感染経路"
quiz = generate_quiz(topic)

# ===============================
# ⑤ 出力
# ===============================
print("📝 自動生成されたクイズ:\n")
print(quiz)
