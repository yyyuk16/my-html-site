// 多言語対応の共通機能
class MultiLanguage {
  constructor() {
    this.currentLanguage = 'ja';
    this.translations = {};
    this.currentUser = null;
    this.db = null;
    this.auth = null;
    // 右下の言語選択ボタンは表示しない
    this.showLanguageButtons = false;
  }

  // Firebase初期化
  initFirebase() {
    if (!firebase.apps.length) {
      const firebaseConfig = {
        apiKey: "AIzaSyB7TuGhOKbB4w7DDYt7KTejy-TrcxVZmpU",
        authDomain: "web01-2484d.firebaseapp.com",
        databaseURL: "https://web01-2484d-default-rtdb.firebaseio.com",
        projectId: "web01-2484d",
        storageBucket: "web01-2484d.firebasestorage.app",
        messagingSenderId: "90159472898",
        appId: "1:90159472898:web:261ec71f9919611011e21b",
        measurementId: "G-9TGR07ZSY9"
      };
      firebase.initializeApp(firebaseConfig);
    }
    this.db = firebase.firestore();
    this.auth = firebase.auth();
  }

  // 言語ファイルを読み込み
  async loadLanguage(language) {
    try {
      // 相対パスで読み込む（ルート配下でない環境でも動作させる）
      const response = await fetch(`lang/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language file: ${language}`);
      }
      this.translations[language] = await response.json();
      return this.translations[language];
    } catch (error) {
      console.error('Error loading language:', error);
      // フォールバックとして日本語を読み込み
      if (language !== 'ja') {
        return await this.loadLanguage('ja');
      }
      return {};
    }
  }

  // ユーザーの言語設定を取得
  async getUserLanguage() {
    if (!this.currentUser) {
      return 'ja'; // デフォルトは日本語
    }

    try {
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.language || 'ja';
      }
    } catch (error) {
      console.error('Error getting user language:', error);
    }
    return 'ja';
  }

  // ユーザーの言語設定を更新
  async updateUserLanguage(language) {
    if (!this.currentUser) {
      return false;
    }

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        language: language
      });
      return true;
    } catch (error) {
      console.error('Error updating user language:', error);
      return false;
    }
  }

  // 言語を切り替え
  async switchLanguage(language) {
    this.currentLanguage = language;
    
    // 翻訳データを読み込み
    await this.loadLanguage(language);
    
    // UIを更新
    this.updateUI();
    
    // ユーザーがログインしている場合はFirestoreを更新
    if (this.currentUser) {
      await this.updateUserLanguage(language);
    }
  }

  // UIを更新
  updateUI() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.translations[this.currentLanguage]?.[key];
      if (translation) {
        // テキストコンテンツを更新
        element.textContent = translation;
        
        // プレースホルダー属性も更新
        if (element.placeholder !== undefined) {
          element.placeholder = translation;
        }
        
        // title属性も更新
        if (element.title !== undefined) {
          element.title = translation;
        }
      }
    });
  }

  // 言語切り替えボタンを作成
  createLanguageButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'language-buttons';
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 5px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    const languages = [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
      { code: 'ko', name: '한국어' }
    ];

    languages.forEach(lang => {
      const button = document.createElement('button');
      button.textContent = lang.name;
      button.style.cssText = `
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: ${this.currentLanguage === lang.code ? '#4CAF50' : '#fff'};
        color: ${this.currentLanguage === lang.code ? '#fff' : '#333'};
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      `;
      
      button.addEventListener('click', () => {
        this.switchLanguage(lang.code);
        // ボタンのスタイルを更新
        buttonContainer.querySelectorAll('button').forEach(btn => {
          btn.style.background = '#fff';
          btn.style.color = '#333';
        });
        button.style.background = '#4CAF50';
        button.style.color = '#fff';
      });

      buttonContainer.appendChild(button);
    });

    document.body.appendChild(buttonContainer);
  }

  // タブ固有のIDを生成
  generateTabId() {
    if (!this.tabId) {
      this.tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('currentTabId', this.tabId);
    }
    return this.tabId;
  }

  // タブ固有の認証状態を管理
  async init() {
    this.initFirebase();
    this.generateTabId();
    
    // タブ固有の認証状態を初期化
    this.setTabAuthState(null);
    
    // まずデフォルト言語（日本語）を読み込んで即座に適用（ラグを減らす）
    await this.loadLanguage('ja');
    this.currentLanguage = 'ja';
    this.updateUI();
    
    // 認証状態を監視（タブ固有）
    this.auth.onAuthStateChanged(async (user) => {
      // タブ固有の認証状態を更新
      this.setTabAuthState(user);
      this.currentUser = user;
      
      if (user) {
        // ログイン済みの場合、ユーザーの言語設定を取得
        const userLanguage = await this.getUserLanguage();
        if (userLanguage !== this.currentLanguage) {
          await this.switchLanguage(userLanguage);
        }
      }
      
      // 言語切り替えボタンは非表示（必要なら this.showLanguageButtons = true に）
      if (this.showLanguageButtons) {
        this.createLanguageButtons();
      }
    });
  }

  // タブ固有の認証状態を設定
  setTabAuthState(user) {
    const tabAuthState = {
      tabId: this.tabId,
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : null,
      timestamp: Date.now()
    };
    sessionStorage.setItem('tabAuthState', JSON.stringify(tabAuthState));
  }

  // タブ固有の認証状態を取得
  getTabAuthState() {
    try {
      const stored = sessionStorage.getItem('tabAuthState');
      if (stored) {
        const state = JSON.parse(stored);
        if (state.tabId === this.tabId) {
          return state;
        }
      }
    } catch (e) {
      console.warn('Failed to get tab auth state:', e);
    }
    return null;
  }

  // 認証状態をリセット（タブ固有）
  resetTabAuthState() {
    this.setTabAuthState(null);
    // Firebase認証からサインアウト
    if (this.auth) {
      this.auth.signOut().catch(error => {
        console.warn('Sign out error:', error);
      });
    }
  }

  // タブが閉じられる時の処理
  handleTabClose() {
    // タブ固有の認証状態をクリア
    sessionStorage.removeItem('tabAuthState');
    sessionStorage.removeItem('currentTabId');
  }
}

// グローバルインスタンスを作成
window.multiLang = new MultiLanguage();

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
  window.multiLang.init();
});
