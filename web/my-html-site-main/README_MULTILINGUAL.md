# 🌍 多言語対応システム

このプロジェクトは、Firebaseを使用した高度な多言語対応システムを提供します。ユーザーの言語設定をFirebaseに保存し、動的にページの言語を切り替えることができます。

## 📋 機能一覧

### ✅ 実装済み機能
- **Firebase連携**: ユーザーの言語設定をFirebaseに保存・取得
- **動的翻訳**: ページ読み込み時に自動翻訳
- **言語選択UI**: 美しい言語選択コンポーネント
- **キャッシュ機能**: 翻訳データの高速アクセス
- **レスポンシブデザイン**: モバイル対応
- **管理画面**: 翻訳データの管理・編集機能
- **バックアップ機能**: 翻訳データのバックアップ・復元
- **エクスポート/インポート**: JSON形式でのデータ移行

### 🌐 対応言語
- 🇯🇵 日本語 (ja)
- 🇺🇸 英語 (en)
- 🇨🇳 中国語 (zh)
- 🇰🇷 韓国語 (ko)
- 🇪🇸 スペイン語 (es)
- 🇫🇷 フランス語 (fr)
- 🇩🇪 ドイツ語 (de)

## 🚀 セットアップ

### 1. 必要なファイルの確認
以下のファイルがプロジェクトに含まれていることを確認してください：

```
templates/
├── translation.js              # メイン翻訳管理システム
├── firebase-translations.js    # Firebase翻訳データ管理
├── language-selector.html      # 言語選択コンポーネント
├── translation-admin.html      # 翻訳管理画面
└── README_MULTILINGUAL.md      # このファイル
```

### 2. HTMLファイルへの統合

#### 基本的な統合手順

1. **Firebase CDNの追加**
```html
<!-- Firebase CDN -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

<!-- 多言語対応スクリプト -->
<script src="translation.js"></script>
<script src="firebase-translations.js"></script>
```

2. **言語選択コンポーネントの追加**
```html
<!-- 言語選択コンポーネント -->
<div class="language-selector">
  <div class="language-selector-container">
    <label for="languageSelect" class="language-label">
      <span class="language-icon">🌍</span>
      <span class="language-text" data-i18n="language">言語</span>
    </label>
    <select id="languageSelect" class="language-select" onchange="changeLanguage(this.value)">
      <option value="ja" data-i18n="ja">日本語</option>
      <option value="en" data-i18n="en">English</option>
      <option value="zh" data-i18n="zh">中文</option>
      <option value="ko" data-i18n="ko">한국어</option>
      <option value="es" data-i18n="es">Español</option>
      <option value="fr" data-i18n="fr">Français</option>
      <option value="de" data-i18n="de">Deutsch</option>
    </select>
  </div>
</div>
```

3. **翻訳キーの追加**
```html
<!-- 翻訳対象の要素に data-i18n 属性を追加 -->
<h1 data-i18n="title">タイトル</h1>
<label data-i18n="email">メールアドレス</label>
<button data-i18n="login">ログイン</button>
```

### 3. 翻訳データの初期化

管理画面（`translation-admin.html`）にアクセスして、以下の手順で初期化してください：

1. **デフォルト翻訳のアップロード**
   - 「デフォルト翻訳をアップロード」ボタンをクリック
   - 基本的な翻訳データがFirebaseに保存されます

2. **翻訳データの確認**
   - 「統計を更新」ボタンで翻訳データの状況を確認
   - 各言語の翻訳キー数を確認

## 📝 使用方法

### 基本的な使用方法

#### 1. ページでの翻訳表示
```html
<!-- 翻訳対象の要素 -->
<h1 data-i18n="welcome">ようこそ</h1>
<p data-i18n="description">これは説明文です</p>
<button data-i18n="submit">送信</button>
```

#### 2. JavaScriptでの翻訳取得
```javascript
// 翻訳テキストを取得
const welcomeText = window.translationManager.getText('welcome', 'ようこそ');
const descriptionText = window.translationManager.getText('description', '説明文');

// アラートでの使用例
alert(window.translationManager.getText('success-message', '成功しました'));
```

#### 3. 言語変更
```javascript
// 言語を変更
window.translationManager.changeLanguage('en');

// または
changeLanguage('en');
```

### 高度な使用方法

#### 1. 動的コンテンツの翻訳
```javascript
// 動的に追加された要素の翻訳
const newElement = document.createElement('div');
newElement.setAttribute('data-i18n', 'dynamic-content');
newElement.textContent = '動的コンテンツ';
document.body.appendChild(newElement);

// 翻訳を実行
window.translationManager.translateElement(newElement);
```

#### 2. カスタム翻訳キーの追加
```javascript
// 新しい翻訳キーを追加
await window.firebaseTranslationManager.updateTranslationKey('ja', 'custom-key', 'カスタムテキスト');
await window.firebaseTranslationManager.updateTranslationKey('en', 'custom-key', 'Custom Text');
```

## 🛠️ 管理機能

### 翻訳管理画面の使用方法

1. **アクセス方法**
   ```
   http://your-domain/translation-admin.html
   ```

2. **主な機能**
   - 📤 **データ管理**: 翻訳データのアップロード、同期、バックアップ
   - 📊 **統計情報**: 言語数、キー数、最終更新日の確認
   - ✏️ **翻訳エディター**: 個別の翻訳キーの編集・追加

3. **操作手順**
   - 言語を選択
   - 翻訳キーを入力
   - 翻訳テキストを入力
   - 「追加」または「更新」ボタンをクリック

### バックアップと復元

#### バックアップの作成
```javascript
// 自動バックアップ
await window.firebaseTranslationManager.backupTranslations();
```

#### データのエクスポート/インポート
1. 管理画面で「翻訳データをエクスポート」をクリック
2. JSONファイルがダウンロードされます
3. 「翻訳データをインポート」でJSONファイルを選択して復元

## 🔧 カスタマイズ

### 新しい言語の追加

1. **翻訳データに言語を追加**
```javascript
// firebase-translations.js の getDefaultTranslations() メソッドに追加
es: {
    'title': 'Aplicación de Gestión Médica',
    'login': 'Iniciar sesión',
    // ... 他の翻訳キー
}
```

2. **言語選択UIに追加**
```html
<option value="es" data-i18n="es">Español</option>
```

### カスタムスタイルの適用

```css
/* 言語選択コンポーネントのカスタマイズ */
.language-selector {
    /* カスタムスタイル */
    background: linear-gradient(135deg, #your-color, #your-color);
    border-radius: 15px;
}

.language-select {
    /* セレクトボックスのカスタマイズ */
    border-color: #your-color;
}
```

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 1. 翻訳が表示されない
- **原因**: Firebaseの初期化が完了していない
- **解決**: ページ読み込み完了後に翻訳を実行
```javascript
document.addEventListener('DOMContentLoaded', () => {
    window.translationManager.initialize();
});
```

#### 2. 言語設定が保存されない
- **原因**: Firebase認証が完了していない
- **解決**: ユーザーログイン後に言語設定を保存
```javascript
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // 言語設定を保存
        window.translationManager.changeLanguage('en');
    }
});
```

#### 3. 翻訳データが読み込めない
- **原因**: Firebaseの権限設定の問題
- **解決**: Firestoreのセキュリティルールを確認
```javascript
// Firestoreのセキュリティルール例
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /translations/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📚 API リファレンス

### TranslationManager クラス

#### メソッド

| メソッド | 説明 | パラメータ | 戻り値 |
|---------|------|-----------|--------|
| `initialize()` | 翻訳システムを初期化 | - | Promise |
| `changeLanguage(language)` | 言語を変更 | language: string | Promise |
| `getText(key, fallback)` | 翻訳テキストを取得 | key: string, fallback: string | string |
| `getCurrentLanguage()` | 現在の言語を取得 | - | string |
| `clearCache()` | キャッシュをクリア | - | void |

### FirebaseTranslationManager クラス

#### メソッド

| メソッド | 説明 | パラメータ | 戻り値 |
|---------|------|-----------|--------|
| `uploadTranslations(translations)` | 翻訳データをアップロード | translations: object | Promise |
| `getTranslations(language)` | 翻訳データを取得 | language?: string | Promise |
| `updateTranslationKey(language, key, value)` | 翻訳キーを更新 | language: string, key: string, value: string | Promise |
| `backupTranslations()` | バックアップを作成 | - | Promise |
| `getTranslationStats()` | 統計情報を取得 | - | Promise |

## 🤝 貢献

このシステムの改善にご協力いただける場合は、以下の手順でお願いします：

1. 新しい翻訳キーの追加
2. バグの報告
3. 機能の提案
4. コードの改善

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

ご質問やサポートが必要な場合は、以下の方法でお問い合わせください：

- GitHub Issues
- メールサポート
- ドキュメントの確認

---

**注意**: このシステムを使用する前に、Firebaseプロジェクトの設定とFirestoreのセキュリティルールを適切に設定してください。

