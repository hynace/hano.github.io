(function () {
  const STORAGE_KEY = "my-homepage-user-posts";

  function showLoadError(message) {
    if (document.querySelector("[data-load-error]")) return;

    const notice = document.createElement("p");
    notice.setAttribute("data-load-error", "true");
    notice.textContent = message;
    notice.style.margin = "1rem 0";
    notice.style.padding = "0.75rem 1rem";
    notice.style.border = "1px solid #f5c2c7";
    notice.style.borderRadius = "0.5rem";
    notice.style.backgroundColor = "#f8d7da";
    notice.style.color = "#842029";

    const target = document.querySelector("main") || document.body;
    target.insertAdjacentElement("afterbegin", notice);
  }

  function createFallbackData(userPosts) {
    return { boards: [], posts: [...userPosts] };
  }

  async function loadData() {
    const userPosts = loadUserPosts();

    try {
      const response = await fetch("data/posts.json");
      if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");

      const base = await response.json();
      const basePosts = Array.isArray(base.posts) ? base.posts : [];
      const baseBoards = Array.isArray(base.boards) ? base.boards : [];
      return { ...base, boards: baseBoards, posts: [...basePosts, ...userPosts] };
    } catch (error) {
      console.error(error);
      showLoadError("데이터를 불러오지 못했습니다. 저장된 게시글만 표시합니다.");
      return createFallbackData(userPosts);
    }
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function parseQuery() {
    return new URLSearchParams(window.location.search);
  }

  function toPostItem(post) {
    const item = document.createElement("li");
    item.className = "post-item";

    const link = document.createElement("a");
    link.className = "post-link";
    link.href = `post.html?board=${encodeURIComponent(post.board)}&id=${encodeURIComponent(post.id)}`;
    link.textContent = String(post.title ?? "");

    const meta = document.createElement("p");
    meta.className = "post-meta";
    meta.textContent = `${String(post.date ?? "")} · ${String(post.boardLabel ?? "")}`;

    item.appendChild(link);
    item.appendChild(meta);
    return item;
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

    const boards = Array.isArray(data.boards) ? data.boards : [];
    boardSelect.innerHTML = "";
    boards.forEach((board) => {
      const option = document.createElement("option");
      option.value = board.key;
      option.textContent = board.label;
      boardSelect.appendChild(option);
    });

    if (!boards.length) {
      messageEl.textContent = "게시판이 없어 글을 등록할 수 없습니다.";
      return;
    }

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
      const saved = saveUserPosts(userPosts);
      if (!saved) {
        messageEl.textContent = "저장소 접근이 제한되어 글을 저장하지 못했습니다.";
        return;
      }

      messageEl.textContent = "글이 등록되었습니다. 메인 목록에 바로 반영됩니다.";
      form.reset();
      dateInput.value = new Date().toISOString().slice(0, 10);

      await renderHome();
    });
  }

  async function renderHome() {
    const data = await loadData();
    const boards = Array.isArray(data.boards) ? data.boards : [];
    const posts = Array.isArray(data.posts) ? data.posts : [];
    const boardLinks = document.getElementById("board-links");
    const recentPosts = document.getElementById("recent-posts");

    boardLinks.innerHTML = "";
    boards.forEach((board) => {
      const boardLink = document.createElement("a");
      boardLink.className = "board-chip";
      boardLink.href = `board.html?board=${encodeURIComponent(board.key)}`;
      boardLink.textContent = board.label;
      boardLinks.appendChild(boardLink);
    });

    const boardLabelMap = Object.fromEntries(boards.map((b) => [b.key, b.label]));
    const merged = posts.map((p) => ({ ...p, boardLabel: boardLabelMap[p.board] || p.board }));
    const recentItems = sortByDateDesc(merged).slice(0, 6);
    recentPosts.innerHTML = "";
    if (!recentItems.length) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "post-item";
      emptyItem.textContent = "아직 등록된 글이 없습니다.";
      recentPosts.appendChild(emptyItem);
    } else {
      recentItems.forEach((post) => {
        recentPosts.appendChild(toPostItem(post));
      });
    }

    setupPostForm(data);
  }

  async function renderBoard() {
    const data = await loadData();
    const params = parseQuery();
    const boards = Array.isArray(data.boards) ? data.boards : [];
    const titleEl = document.getElementById("board-title");
    const listEl = document.getElementById("board-posts");

    if (!boards.length) {
      titleEl.textContent = "게시판이 없습니다";
      listEl.innerHTML = `<li class="post-item">게시판이 없습니다.</li>`;
      return;
    }

    const boardKey = params.get("board") || boards[0].key;

    const board = boards.find((b) => b.key === boardKey);

    titleEl.textContent = board ? `${board.label} 게시판` : "게시판";

    const posts = sortByDateDesc(data.posts)
      .filter((p) => p.board === boardKey)
      .map((p) => ({ ...p, boardLabel: board ? board.label : p.board }));

    listEl.innerHTML = "";
    if (!posts.length) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "post-item";
      emptyItem.textContent = "아직 등록된 글이 없습니다.";
      listEl.appendChild(emptyItem);
      return;
    }

    posts.forEach((post) => {
      listEl.appendChild(toPostItem(post));
    });
  }

  async function renderPost() {
    const data = await loadData();
    const params = parseQuery();
    const boardKey = params.get("board");
    const id = params.get("id");
    const boards = Array.isArray(data.boards) ? data.boards : [];
    const posts = Array.isArray(data.posts) ? data.posts : [];

    const board = boards.find((b) => b.key === boardKey);
    const post = posts.find((p) => p.board === boardKey && p.id === id);

    const backEl = document.getElementById("board-back");
    const titleEl = document.getElementById("post-title");
    const metaEl = document.getElementById("post-meta");
    const contentEl = document.getElementById("post-content");

    if (!post) {
      titleEl.textContent = "게시글을 찾을 수 없습니다";
      metaEl.textContent = "";
      contentEl.textContent = "잘못된 주소이거나 삭제된 글입니다.";
      backEl.href = "index.html";
      return;
    }

    backEl.href = `board.html?board=${encodeURIComponent(boardKey)}`;
    backEl.textContent = `← ${(board && board.label) || boardKey} 게시판으로`;

    titleEl.textContent = post.title;
    metaEl.textContent = `${post.date} · ${board ? board.label : boardKey}`;
    const lines = Array.isArray(post.content)
      ? post.content
      : post.content === null || post.content === undefined
        ? []
        : [post.content];
    contentEl.textContent = "";
    lines
      .map((line) => String(line ?? "").trim())
      .filter(Boolean)
      .forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        contentEl.appendChild(p);
      });
  }

  window.BlogUI = { renderHome, renderBoard, renderPost };
})();
