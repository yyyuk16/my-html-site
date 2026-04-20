# CSSファイル構成ガイド

このプロジェクトのCSSファイルは以下のように整理されています。

## 📁 ファイル構成

```
static/css/
├── main.css          # メインスタイル（共通コンポーネント）
├── chat.css          # チャット機能専用スタイル
├── components.css    # ページ固有コンポーネント
├── themes.css        # テーマ別スタイル定義
└── README.md         # このファイル
```

---

## 各CSSファイルの概要

### main.css
```
/*
  main.css - メインスタイル（共通コンポーネント）
  ---------------------------------------------
  ・プロジェクト全体で使用される共通のスタイルとベースデザイン
  ・カラーテーマ定義、リセット、ボタン・カード・フォーム・グリッドなどの共通UI
  ・ユーティリティクラスやレスポンシブ対応も含む
  ・すべてのページで必須
*/
```

### chat.css
```
/*
  chat.css - チャット機能専用スタイル
  -----------------------------------
  ・チャット画面のレイアウトやメッセージ吹き出し、入力エリアなどチャット特化のデザイン
  ・ユーザーA/Bのメッセージ、送信状態、スクロールバーなどもカバー
  ・チャット機能があるページで使用
*/
```

### components.css
```
/*
  components.css - ページ固有コンポーネント
  ----------------------------------------
  ・プロフィール、スコア、リスト、フォームなど特定ページ専用のスタイル
  ・各種カードやアバター、リストアイテム、フォームレイアウトなど
  ・該当ページで必要に応じて読み込む
*/
```

### themes.css
```
/*
  themes.css - テーマ別スタイル定義
  --------------------------------
  ・ピンク、ブルー、ダーク、ライトの4テーマをCSS変数で切り替え
  ・テーマ切り替えボタンやアニメーション、テーマ固有のコンポーネントも定義
  ・全ページでテーマ機能を使う場合に読み込む
*/
```

---

## 🎨 使用方法

### 1. 基本的な使用方法

HTMLファイルの`<head>`セクションで以下のように読み込んでください：

```html
<!-- メインスタイル（必須） -->
<link rel="stylesheet" href="/static/css/main.css">

<!-- チャット機能を使用する場合 -->
<link rel="stylesheet" href="/static/css/chat.css">

<!-- ページ固有コンポーネントを使用する場合 -->
<link rel="stylesheet" href="/static/css/components.css">

<!-- テーマ機能を使用する場合 -->
<link rel="stylesheet" href="/static/css/themes.css">
```

### 2. テーマの適用

`<body>`タグにテーマクラスを追加することで、テーマを切り替えることができます：

```html
<!-- ピンクテーマ（デフォルト） -->
<body class="theme-pink">

<!-- ブルーテーマ -->
<body class="theme-blue">

<!-- ダークテーマ -->
<body class="theme-dark">

<!-- ライトテーマ -->
<body class="theme-light">
```

### 3. テーマ切り替えボタンの追加

テーマを動的に切り替える場合は、以下のHTMLを追加してください：

```html
<div class="theme-switcher">
  <button class="theme-btn pink active" onclick="setTheme('pink')">🌸</button>
  <button class="theme-btn blue" onclick="setTheme('blue')">🌊</button>
  <button class="theme-btn dark" onclick="setTheme('dark')">🌙</button>
  <button class="theme-btn light" onclick="setTheme('light')">☀️</button>
</div>
```

そして、以下のJavaScriptを追加してください：

```javascript
function setTheme(theme) {
  // 既存のテーマクラスを削除
  document.body.classList.remove('theme-pink', 'theme-blue', 'theme-dark', 'theme-light');
  
  // 新しいテーマクラスを追加
  document.body.classList.add(`theme-${theme}`);
  
  // アクティブボタンを更新
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.theme-btn.${theme}`).classList.add('active');
  
  // ローカルストレージに保存
  localStorage.setItem('theme', theme);
}

// ページ読み込み時に保存されたテーマを適用
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'pink';
  setTheme(savedTheme);
});
```

## 🧩 利用可能なコンポーネント

### ボタン
```html
<button class="btn">通常ボタン</button>
<button class="btn btn-secondary">セカンダリボタン</button>
<button class="btn btn-outline">アウトラインボタン</button>
```

### カード
```html
<div class="card">
  <h3>カードタイトル</h3>
  <p>カードの内容</p>
</div>
```

### フォーム
```html
<div class="form-group">
  <label class="form-label">ラベル</label>
  <input type="text" class="form-input" placeholder="プレースホルダー">
</div>
```

### グリッドレイアウト
```html
<div class="grid grid-2">
  <div>アイテム1</div>
  <div>アイテム2</div>
</div>

<div class="grid grid-3">
  <div>アイテム1</div>
  <div>アイテム2</div>
  <div>アイテム3</div>
</div>
```

### ユーティリティクラス
```html
<!-- テキスト配置 -->
<div class="text-center">中央揃え</div>
<div class="text-left">左揃え</div>
<div class="text-right">右揃え</div>

<!-- マージン -->
<div class="mt-2">上マージン</div>
<div class="mb-3">下マージン</div>

<!-- パディング -->
<div class="p-2">パディング</div>

<!-- 表示 -->
<div class="d-none">非表示</div>
<div class="d-flex">フレックス表示</div>
<div class="d-grid">グリッド表示</div>
```

## 🎯 ページ別の推奨構成

### チャットページ
```html
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/chat.css">
```

### プロフィールページ
```html
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/components.css">
```

### スコア・成績ページ
```html
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/components.css">
```

### リスト・一覧ページ
```html
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/components.css">
```

### フォーム・入力ページ
```html
<link rel="stylesheet" href="/static/css/main.css">
<link rel="stylesheet" href="/static/css/components.css">
```

## 🔧 カスタマイズ

### カラーの変更

`main.css`の`:root`セクションでカラー変数を変更できます：

```css
:root {
  --primary-color: #FF6B9D;    /* プライマリカラー */
  --secondary-color: #FF8FB1;  /* セカンダリカラー */
  --background-color: #FFF5F6; /* 背景色 */
  /* その他のカラー... */
}
```

### 新しいテーマの追加

`themes.css`に新しいテーマクラスを追加できます：

```css
.theme-custom {
  --primary-color: #YOUR_COLOR;
  --secondary-color: #YOUR_COLOR;
  --background-color: #YOUR_COLOR;
  /* その他の変数... */
}
```

## 📱 レスポンシブ対応

すべてのコンポーネントは768px以下の画面サイズに対応しています。必要に応じて、追加のブレークポイントを設定できます。

## 🚀 パフォーマンス最適化

- CSSファイルは必要最小限のものだけを読み込んでください
- 未使用のCSSクラスは削除してください
- 画像やアイコンは適切なサイズで最適化してください 