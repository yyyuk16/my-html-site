// メモ共有アプリ本体
// - jQuery
// - Firebase (Firestore)

(function ($) {
  let db = null;
  let memos = [];

  function showStatus(message, type) {
    const $status = $("#saveStatus");
    $status.text(message);
    $status.removeClass("success error");
    if (type) {
      $status.addClass(type);
    }
    if (message) {
      setTimeout(() => {
        $status.fadeOut(300, () => {
          $status.text("").show().removeClass("success error");
        });
      }, 2500);
    }
  }

  function initFirebase() {
    if (typeof firebase === "undefined") {
      console.error("Firebase SDK が読み込まれていません。");
      return;
    }
    if (typeof firebaseConfig === "undefined") {
      console.error("firebaseConfig が定義されていません。firebase-config.js を確認してください。");
      showStatus("Firebase の設定ファイルが見つかりません。", "error");
      return;
    }

    try {
      const app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore(app);
    } catch (e) {
      console.error("Firebase 初期化エラー:", e);
      showStatus("Firebase の初期化に失敗しました。コンソールを確認してください。", "error");
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}/${m}/${d} ${hh}:${mm}`;
  }

  function applyFilter() {
    const keyword = $("#searchKeyword").val().trim().toLowerCase();
    const $list = $("#memoList");
    $list.empty();

    const filtered = keyword
      ? memos.filter((m) => {
          const text = `${m.title || ""} ${m.content || ""}`.toLowerCase();
          return text.includes(keyword);
        })
      : memos;

    if (!filtered.length) {
      $list.append(
        $("<div>").addClass("empty-message").text("条件に合うメモがありません。キーワードを変えてみてください。")
      );
      return;
    }

    filtered.forEach((memo) => {
      const $card = $("<article>").addClass("memo-card");

      const $titleRow = $("<div>").addClass("memo-title-row");
      const $title = $("<h3>").addClass("memo-title").text(memo.title || "(無題のメモ)");
      $titleRow.append($title);

      const $meta = $("<div>").addClass("memo-meta");

      if (memo.category) {
        $meta.append($("<span>").addClass("memo-category").text(memo.category));
      }

      if (memo.author) {
        $meta.append(
          $("<span>")
            .addClass("memo-author")
            .text(memo.author)
        );
      }

      if (memo.createdAt) {
        $meta.append(
          $("<span>")
            .addClass("memo-timestamp")
            .text(formatTimestamp(memo.createdAt))
        );
      }

      const $content = $("<p>").addClass("memo-content").text(memo.content || "");

      $card.append($titleRow, $meta, $content);
      $list.append($card);
    });
  }

  function subscribeMemos() {
    if (!db) return;

    db.collection("memos")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          memos = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "",
              content: data.content || "",
              category: data.category || "",
              author: data.author || "",
              createdAt: data.createdAt || null
            };
          });
          applyFilter();
        },
        (error) => {
          console.error("メモ購読中にエラー:", error);
          showStatus("メモの取得に失敗しました。ネットワークや Firebase 設定を確認してください。", "error");
        }
      );
  }

  function setupForm() {
    const $userName = $("#userName");
    const savedName = localStorage.getItem("memoAppUserName");
    if (savedName) {
      $userName.val(savedName);
    }

    $userName.on("change blur", function () {
      const name = $(this).val().trim();
      if (name) {
        localStorage.setItem("memoAppUserName", name);
      } else {
        localStorage.removeItem("memoAppUserName");
      }
    });

    $("#memoForm").on("submit", function (e) {
      e.preventDefault();
      if (!db) {
        showStatus("Firebase が初期化されていません。", "error");
        return;
      }

      const title = $("#memoTitle").val().trim();
      const content = $("#memoContent").val().trim();
      const category = $("#memoCategory").val().trim();
      const author = $userName.val().trim();

      if (!title || !content) {
        showStatus("タイトルと内容は必須です。", "error");
        return;
      }

      showStatus("保存中...", null);

      db.collection("memos")
        .add({
          title,
          content,
          category,
          author,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          $("#memoTitle").val("");
          $("#memoContent").val("");
          $("#memoCategory").val("");
          showStatus("メモを保存しました。", "success");
        })
        .catch((error) => {
          console.error("メモ保存エラー:", error);
          showStatus("メモの保存に失敗しました。", "error");
        });
    });
  }

  function setupSearch() {
    $("#searchKeyword").on("input", function () {
      applyFilter();
    });

    $("#clearSearch").on("click", function () {
      $("#searchKeyword").val("");
      applyFilter();
    });
  }

  $(function () {
    initFirebase();
    setupForm();
    setupSearch();
    subscribeMemos();
  });
})(jQuery);

