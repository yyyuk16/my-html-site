## 教育向けメモ共有 Web アプリ（ハッカソン用スターター）

このフォルダは、**教育用の情報共有・メモアプリ**を素早く作るための土台です。  
Laravel をフルセットアップする代わりに、以下の構成で **PHP + jQuery + Firebase(Firestore)** によるシンプルなメモ画面を用意しています。

- **バックエンド**: PHP（1ファイル構成のシンプルなエントリーポイント）
- **フロントエンド**: HTML / CSS / JavaScript (jQuery)
- **データベース**: Firebase Firestore（クライアントサイドから直接アクセス）

> メモデータはすべて Firebase Firestore に保存される前提です。  
> PHP 側は「画面を返すだけ」にしているので、必要になったら Laravel プロジェクトに組み込んでください。

---

### フォルダ構成

- `public/`
  - `index.php` … メモアプリのメイン画面（PHP エントリーポイント）
  - `css/style.css` … 画面デザイン
  - `js/app.js` … jQuery + Firebase(Firestore) を使ったメモ機能本体
  - `js/firebase-config.sample.js` … Firebase 設定サンプル（これをコピーして `firebase-config.js` を作成）
- `composer.json` … PHP プロジェクト用の依存定義（Laravel 導入時に利用できます）
- `.gitignore` … Firebase の実際の設定ファイルなどを Git に含めないための設定

---

### 必要なもの

- PHP（ローカルで `php -S` などが使える状態）
- Firebase プロジェクト（Firestore を有効化）
- ブラウザ（Chrome / Edge など）

Laravel を本格的に使いたい場合は、後からこのフォルダの中で

```bash
composer create-project laravel/laravel .
```

などを実行して Laravel プロジェクトを作成し、`resources/views` や `public/` にこのサンプルの HTML / JS / CSS を移植して使ってください。

---

### 1. Firebase プロジェクトの準備

1. `https://console.firebase.google.com` で新しいプロジェクトを作成
2. 「ウェブアプリを追加」から Web アプリを作成
3. 表示される Firebase 設定（`apiKey`, `authDomain`, `projectId`, など）をメモ
4. Firestore データベースを作成（ネイティブモード）

---

### 2. Firebase 設定ファイルの作成

1. `public/js/firebase-config.sample.js` をコピーして、**`firebase-config.js`** という名前で同じフォルダに作成します。
2. 中の `firebaseConfig` の値を、あなたの Firebase プロジェクトの値で書き換えます。

```js
// public/js/firebase-config.js（例）
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // 必要に応じて他のキーも追加
};
```

> **注意**: `firebase-config.js` は `.gitignore` により Git にコミットされないようになっています。

---

### 3. 開発用サーバの起動（PHP ビルトインサーバ）

このフォルダのルート（`README.md` がある場所）で、以下のコマンドを実行します。

```bash
php -S localhost:8000 -t public
```

その後、ブラウザで `http://localhost:8000` にアクセスすると、メモアプリの画面が開きます。

---

### 4. メモ画面の概要

- **メモ一覧表示**
  - Firestore の `memos` コレクションをリアルタイムに購読して一覧表示します。
  - 作成日時の新しい順に表示します。
- **メモ作成フォーム**
  - 「タイトル」「内容」「カテゴリ」「投稿者名（任意）」を入力してメモを追加します。
  - 送信すると Firestore に保存され、一覧に即時反映されます。
- **検索・フィルタ**
  - キーワード入力で、タイトル・内容にマッチするメモだけを絞り込み表示します（クライアントサイドフィルタ）。

---

### 5. Laravel への発展

ハッカソンの時間に余裕があれば、以下のように発展させられます。

- Laravel プロジェクトを作成し、今回の `index.php` の中身を `resources/views/memos.blade.php` などに移植
- Laravel のルーティング（`routes/web.php`）で `/memos` へのルートを作成
- Firebase ではなく、Laravel + RDBMS(MySQL 等) を使うバージョンを別画面として用意して比較
- Laravel の認証機能（Laravel Breeze / Jetstream 等）を使って、ログインユーザごとのメモ管理

---

### 6. 次のステップのアイデア

- メモに「いいね」や「既読」フラグをつける
- 授業ごと / クラスごとのルーム機能をつける
- 教員アカウントが「ピン留め」できる重要メモ機能
- メモに画像やファイルを添付（Firebase Storage 利用）

ハッカソンでは、まずこの土台をベースに **「1〜2個の小さな価値ある機能」に絞って実装** していくと、時間内に完成させやすいです。

