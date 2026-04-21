(function () {
  const STORAGE_KEY = "my-homepage-user-posts";

  async function loadData() {
    const response = await fetch("data/posts.json");
    if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");

    const base = await response.json();
    const userPosts = loadUserPosts();
    return { ...base, posts: [...base.posts, ...userPosts] };
  }

  function loadUserPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveUserPosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
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

  function toId(title) {
    const normalized = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);

    return `${normalized || "post"}-${Date.now().toString(36)}`;
  }

  function setupPostForm(data) {
    const form = document.getElementById("post-form");
    if (!form) return;

    const boardSelect = document.getElementById("form-board");
    const dateInput = document.getElementById("form-date");
    const messageEl = document.getElementById("form-message");

    boardSelect.innerHTML = data.boards
      .map((board) => `<option value="${board.key}">${board.label}</option>`)
      .join("");

    if (!dateInput.value) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }

    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const title = document.getElementById("form-title").value.trim();
      const board = boardSelect.value;
      const date = dateInput.value;
      const content = document
        .getElementById("form-content")
        .value.split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!title || !board || !date || !content.length) {
        messageEl.textContent = "모든 항목을 입력해주세요.";
        return;
      }

      const userPosts = loadUserPosts();
      userPosts.push({
        id: toId(title),
        board,
        title,
        date,
        content
      });
      saveUserPosts(userPosts);

      messageEl.textContent = "글이 등록되었습니다. 메인 목록에 바로 반영됩니다.";
      form.reset();
      dateInput.value = new Date().toISOString().slice(0, 10);

      await renderHome();
    });
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

    setupPostForm(data);
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
