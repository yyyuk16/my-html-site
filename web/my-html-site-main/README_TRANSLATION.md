# 多言語翻訳機能の使用方法

## 概要
このシステムは、ユーザーが選択した言語に基づいてウェブサイト全体を自動翻訳する機能を提供します。

## セットアップ手順

### 1. Google Translate API キーの設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. Cloud Translation API を有効化
4. API キーを作成
5. `translation.js` ファイル内の `YOUR_GOOGLE_TRANSLATE_API_KEY` を実際のAPIキーに置き換え

```javascript
// translation.js の該当部分を編集
const apiKey = 'YOUR_ACTUAL_API_KEY_HERE';
```

### 2. HTMLファイルへの翻訳機能追加

#### 必要なスクリプトの読み込み
各HTMLファイルの `<head>` セクションに以下を追加：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

<!-- 翻訳機能 -->
<script src="translation.js"></script>
```

#### 翻訳対象テキストのマークアップ
翻訳したいテキストに `data-translate` 属性を追加：

```html
<!-- 変更前 -->
<h1>医療管理アプリ</h1>

<!-- 変更後 -->
<h1 data-translate="医療管理アプリ">医療管理アプリ</h1>
```

### 3. 新規登録時の言語選択
`signup.html` には既に言語選択機能が実装されています。ユーザーが選択した言語はFirebaseに保存されます。

## 対応言語
- 日本語 (ja)
- 英語 (en)
- 中国語 (zh)
- 韓国語 (ko)

## 使用方法

### 1. ユーザー登録時
1. 新規登録ページで言語を選択
2. 選択した言語がFirebaseに保存される

### 2. ページ表示時
1. ページ読み込み時にFirebaseからユーザーの言語設定を取得
2. 日本語以外の言語が選択されている場合、自動的に翻訳が実行される
3. `data-translate` 属性を持つ要素のテキストが翻訳される

### 3. 言語変更時
1. 言語選択ドロップダウンで言語を変更
2. 変更がFirebaseに保存される
3. ページ全体が新しい言語で再翻訳される

## 実装済みページ
- ✅ `signup.html` - 新規登録ページ
- ✅ `home.html` - ホームページ
- ✅ `chat.html` - チャットページ
- ✅ `list.html` - 患者診療記録ページ
- ✅ `docterprofile.html` - 医師プロフィールページ
- ✅ `ai.html` - AIチャットページ
- ✅ `score.html` - Q&Aページ
- ✅ `movie.html` - 動画視聴ページ
- ✅ `profile.html` - プロフィール設定ページ
- ⏳ その他のページは順次実装予定

## 注意事項

### 1. API制限
- Google Translate API には利用制限があります
- 大量の翻訳リクエストには注意が必要です

### 2. 翻訳品質
- 機械翻訳のため、医療用語など専門的な表現は注意が必要です
- 重要な医療情報は専門家による確認を推奨します

### 3. パフォーマンス
- 翻訳処理には時間がかかる場合があります
- ページ読み込み時の翻訳処理は非同期で実行されます

## トラブルシューティング

### 翻訳が動作しない場合
1. APIキーが正しく設定されているか確認
2. Firebaseの設定が正しいか確認
3. ブラウザのコンソールでエラーメッセージを確認

### 翻訳が不完全な場合
1. `data-translate` 属性が正しく設定されているか確認
2. 翻訳対象のテキストが適切にマークアップされているか確認

## 今後の拡張予定
- より多くの言語への対応
- 翻訳キャッシュ機能
- カスタム翻訳辞書機能
- 医療専門用語の翻訳精度向上
