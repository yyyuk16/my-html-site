/**
 * 共通ヘッダーを header.html から読み込み #site-header に差し込む。
 * 現在ページに応じて .tab-menu a に .active を付与。
 */
(function () {
  async function loadHeader() {
    var container = document.getElementById('site-header');
    if (!container) return;

    try {
      var res = await fetch('header.html');
      var html = await res.text();
      container.innerHTML = html;

      var path = window.location.pathname || '';
      var current = '';
      if (path.endsWith('ai.html') || path.endsWith('/ai')) current = 'ai';
      else if (path.endsWith('score.html') || path.endsWith('/score')) current = 'score';
      else if (path.endsWith('movie.html') || path.endsWith('/movie')) current = 'movie';
      else if (path.endsWith('setting.html') || path.endsWith('/setting')) current = 'setting';

      if (current) {
        var links = container.querySelectorAll('.tab-menu a[data-page]');
        links.forEach(function (a) {
          if (a.getAttribute('data-page') === current) a.classList.add('active');
        });
      }

      if (typeof updateUserName === 'function') updateUserName();
      if (window.multiLang && typeof window.multiLang.updateUI === 'function') {
        try { window.multiLang.updateUI(); } catch (_) {}
      }
    } catch (e) {
      console.error('ヘッダー読み込み失敗:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
