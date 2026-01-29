<?php
// シンプルなエントリーポイント（PHP ビルトインサーバで動作させる想定）
?><!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教育メモ共有アプリ（ハッカソン用）</title>
  <link rel="stylesheet" href="css/style.css">

  <!-- jQuery CDN -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"
          integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
          crossorigin="anonymous"></script>

  <!-- Firebase SDK（Compat 版 / Firestore 用）-->
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>

  <!-- あなたの Firebase 設定（firebase-config.js は sample からコピーして作成） -->
  <script src="js/firebase-config.js"></script>

  <!-- アプリ本体 -->
  <script src="js/app.js" defer></script>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="title-block">
        <h1>教育メモ共有アプリ</h1>
        <p class="subtitle">授業の気づきやノートを、みんなで共有しよう</p>
      </div>
      <div class="user-block">
        <label for="userName">あなたの名前</label>
        <input id="userName" type="text" placeholder="例：山田 太郎">
        <span class="user-note">※ 未入力でも投稿できます</span>
      </div>
    </header>

    <main class="app-main">
      <section class="memo-form-section">
        <h2>メモを追加する</h2>
        <form id="memoForm">
          <div class="form-row">
            <label for="memoTitle">タイトル</label>
            <input id="memoTitle" type="text" placeholder="例：微分の公式のまとめ" required>
          </div>

          <div class="form-row">
            <label for="memoCategory">カテゴリ</label>
            <input id="memoCategory" type="text" placeholder="例：数学 / 英語 / プロジェクト管理">
          </div>

          <div class="form-row">
            <label for="memoContent">内容</label>
            <textarea id="memoContent" rows="5" placeholder="授業のポイントや自分のメモを書いてください" required></textarea>
          </div>

          <div class="form-row form-row-inline">
            <button type="submit" class="btn-primary">メモを保存</button>
            <span id="saveStatus" class="status-message"></span>
          </div>
        </form>
      </section>

      <section class="memo-list-section">
        <div class="memo-list-header">
          <h2>みんなのメモ</h2>
          <div class="filter-row">
            <input id="searchKeyword" type="text" placeholder="キーワードで検索（タイトル・内容）">
            <button id="clearSearch" class="btn-secondary">クリア</button>
          </div>
        </div>

        <div id="memoList" class="memo-list">
          <div class="empty-message">
            まだメモがありません。左のフォームから最初のメモを追加してみましょう！
          </div>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>ハッカソン用スターター &mdash; 教育向けメモ共有アプリ</p>
    </footer>
  </div>
</body>
</html>

