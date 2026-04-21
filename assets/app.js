(function () {
  async function loadData() {
    const response = await fetch("data/posts.json");
    if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");
    return response.json();
  }

  function parseQuery() {
    return new URLSearchParams(window.location.search);
  }

  function toPostItem(post) {
    return `<li class="post-item">
      <a class="post-link" href="post.html?board=${encodeURIComponent(post.board)}&id=${encodeURIComponent(post.id)}">${post.title}</a>
      <p class="post-meta">${post.date} · ${post.boardLabel}</p>
    </li>`;
  }

  function sortByDateDesc(posts) {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async function renderHome() {
    const data = await loadData();
    const boardLinks = document.getElementById("board-links");
    const recentPosts = document.getElementById("recent-posts");

    boardLinks.innerHTML = data.boards
      .map(
        (board) =>
          `<a class="board-chip" href="board.html?board=${encodeURIComponent(board.key)}">${board.label}</a>`
      )
      .join("");

    const boardLabelMap = Object.fromEntries(data.boards.map((b) => [b.key, b.label]));
    const merged = data.posts.map((p) => ({ ...p, boardLabel: boardLabelMap[p.board] || p.board }));
    recentPosts.innerHTML = sortByDateDesc(merged)
      .slice(0, 6)
      .map(toPostItem)
      .join("");
  }

  async function renderBoard() {
    const data = await loadData();
    const params = parseQuery();
    const boardKey = params.get("board") || data.boards[0].key;

    const board = data.boards.find((b) => b.key === boardKey);
    const titleEl = document.getElementById("board-title");
    const listEl = document.getElementById("board-posts");

    titleEl.textContent = board ? `${board.label} 게시판` : "게시판";

    const posts = sortByDateDesc(data.posts)
      .filter((p) => p.board === boardKey)
      .map((p) => ({ ...p, boardLabel: board ? board.label : p.board }));

    listEl.innerHTML = posts.length
      ? posts.map(toPostItem).join("")
      : `<li class="post-item">아직 등록된 글이 없습니다.</li>`;
  }

  async function renderPost() {
    const data = await loadData();
    const params = parseQuery();
    const boardKey = params.get("board");
    const id = params.get("id");

    const board = data.boards.find((b) => b.key === boardKey);
    const post = data.posts.find((p) => p.board === boardKey && p.id === id);

    const backEl = document.getElementById("board-back");
    const titleEl = document.getElementById("post-title");
    const metaEl = document.getElementById("post-meta");
    const contentEl = document.getElementById("post-content");

    if (!post) {
      titleEl.textContent = "게시글을 찾을 수 없습니다";
      metaEl.textContent = "";
      contentEl.innerHTML = "<p>잘못된 주소이거나 삭제된 글입니다.</p>";
      backEl.href = "index.html";
      return;
    }

    backEl.href = `board.html?board=${encodeURIComponent(boardKey)}`;
    backEl.textContent = `← ${(board && board.label) || boardKey} 게시판으로`;

    titleEl.textContent = post.title;
    metaEl.textContent = `${post.date} · ${board ? board.label : boardKey}`;
    contentEl.innerHTML = post.content.map((line) => `<p>${line}</p>`).join("");
  }

  window.BlogUI = { renderHome, renderBoard, renderPost };
})();
