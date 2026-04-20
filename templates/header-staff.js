/**
 * ヘッダーのプロフィール（ログインユーザー名・アバター1文字）を更新する。
 * @param {firebase.User} user
 * @param {firebase.firestore.Firestore} db
 * @param {object} [prefetchedUserData] users/{uid} を既に取得済みの場合（省略可）
 */
(function () {
  function firstChar(str) {
    if (!str || !String(str).trim()) return '?';
    var s = String(str).trim();
    return Array.from(s)[0] || '?';
  }

  /** Firestore users ドキュメントから表示名候補を取得 */
  function pickProfileName(d) {
    if (!d || typeof d !== 'object') return '';
    var keys = ['name', 'displayName', 'userName', 'fullName', 'nickname'];
    for (var i = 0; i < keys.length; i++) {
      var v = d[keys[i]];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return '';
  }

  window.updateHeaderStaffDisplay = async function (user, db, prefetchedUserData) {
    if (!user) return;
    var nameEl = document.getElementById('headerStaffName');
    var avEl = document.getElementById('headerStaffAvatar');
    if (!nameEl && !avEl) return;

    function setDisplay(name) {
      var n = name && String(name).trim() ? String(name).trim() : '';
      if (!n && user.email) n = user.email.split('@')[0];
      if (!n) n = 'ユーザー';
      if (nameEl) nameEl.textContent = n;
      if (avEl) avEl.textContent = firstChar(n);
    }

    var fromPre = prefetchedUserData ? pickProfileName(prefetchedUserData) : '';
    if (fromPre) {
      setDisplay(fromPre);
      return;
    }

    if (user.displayName && String(user.displayName).trim()) {
      setDisplay(user.displayName);
      return;
    }

    if (db) {
      try {
        var doc = await db.collection('users').doc(user.uid).get();
        var d = doc.exists ? doc.data() : {};
        var fromDoc = pickProfileName(d);
        if (fromDoc) {
          setDisplay(fromDoc);
          return;
        }
      } catch (e) {}
    }

    setDisplay('');
  };
})();
