// タブ固有の認証状態管理
class TabAuthManager {
  constructor() {
    this.tabId = this.generateTabId();
    this.init();
  }

  generateTabId() {
    let tabId = sessionStorage.getItem('currentTabId');
    if (!tabId) {
      tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('currentTabId', tabId);
    }
    return tabId;
  }

  init() {
    // ページ読み込み時に認証状態をリセット
    this.resetAuthState();
    
    // タブが閉じられる時の処理
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // ページが非表示になる時の処理
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAuth();
      } else {
        this.resumeAuth();
      }
    });
  }

  // 認証状態をリセット
  resetAuthState() {
    // 他のタブの認証状態をクリア
    this.clearOtherTabsAuth();
    
    // 現在のタブの認証状態を初期化
    sessionStorage.setItem('tabAuthState', JSON.stringify({
      tabId: this.tabId,
      user: null,
      timestamp: Date.now()
    }));
  }

  // 他のタブの認証状態をクリア
  clearOtherTabsAuth() {
    try {
      const currentTabAuth = sessionStorage.getItem('tabAuthState');
      if (currentTabAuth) {
        const state = JSON.parse(currentTabAuth);
        if (state.tabId !== this.tabId) {
          // 他のタブの認証状態なのでクリア
          sessionStorage.removeItem('tabAuthState');
        }
      }
    } catch (e) {
      console.warn('Failed to clear other tabs auth:', e);
    }
  }

  // 認証状態を一時停止
  pauseAuth() {
    // 認証状態の監視を一時停止
    if (window.multiLang && window.multiLang.auth) {
      // 認証状態をリセット
      this.resetAuthState();
    }
  }

  // 認証状態を再開
  resumeAuth() {
    // 認証状態を再チェック
    this.checkAuthState();
  }

  // 認証状態をチェック
  checkAuthState() {
    if (window.multiLang && window.multiLang.getTabAuthState) {
      const tabAuthState = window.multiLang.getTabAuthState();
      if (tabAuthState && tabAuthState.tabId === this.tabId) {
        return tabAuthState.user;
      }
    }
    return null;
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

  // クリーンアップ
  cleanup() {
    sessionStorage.removeItem('tabAuthState');
    sessionStorage.removeItem('currentTabId');
  }
}

// グローバルインスタンスを作成
window.tabAuthManager = new TabAuthManager();
