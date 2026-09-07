(function () {
  const DEFAULT_PATH = "README.md";

  const treeEl = document.getElementById("tree");
  const docEl = document.getElementById("doc");

  const STORAGE_KEY = "devmind-docs-ui-state";

  // Set while search-driven filtering is mutating <details>.open so the
  // toggle listener below doesn't persist those as manual expand/collapse.
  let isFiltering = false;
  let searchItems = []; // { link, li, searchText }

  function loadUIState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { expanded: [], sidebarCollapsed: false };
      const parsed = JSON.parse(raw);
      return {
        expanded: Array.isArray(parsed.expanded) ? parsed.expanded : [],
        sidebarCollapsed: !!parsed.sidebarCollapsed,
      };
    } catch (e) {
      return { expanded: [], sidebarCollapsed: false };
    }
  }

  function saveUIState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable (private mode / quota) — fail silently, non-critical
    }
  }

  function expandAncestors(relPath, expandedSet) {
    const segments = relPath.split("/");
    segments.pop(); // drop the filename itself
    let acc = "";
    for (const seg of segments) {
      acc = acc ? acc + "/" + seg : seg;
      expandedSet.add(acc);
    }
  }

  function buildTree(nodes, container, parentPath, expandedSet) {
    const ul = document.createElement("ul");
    for (const node of nodes) {
      const li = document.createElement("li");
      if (node.type === "dir") {
        const dirPath = parentPath ? parentPath + "/" + node.name : node.name;
        const details = document.createElement("details");
        details.open = expandedSet.has(dirPath);
        details.dataset.path = dirPath;
        const summary = document.createElement("summary");
        summary.textContent = node.name;
        details.appendChild(summary);
        details.addEventListener("toggle", () => {
          if (isFiltering) return;
          const state = loadUIState();
          const set = new Set(state.expanded);
          if (details.open) set.add(dirPath);
          else set.delete(dirPath);
          state.expanded = Array.from(set);
          saveUIState(state);
        });
        buildTree(node.children, details, dirPath, expandedSet);
        li.appendChild(details);
      } else {
        const a = document.createElement("a");
        a.href = "#" + encodeURIComponent(node.path);
        a.textContent = node.name.replace(/\.md$/, "");
        a.dataset.path = node.path;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          loadFile(node.path);
        });
        li.appendChild(a);
      }
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  function setActiveLink(activePath) {
    const links = treeEl.querySelectorAll("a[data-path]");
    for (const link of links) {
      link.classList.toggle("active", link.dataset.path === activePath);
    }
  }

  function loadFile(relPath) {
    const raw = window.NOTES_DATA.files[relPath];
    if (raw === undefined) {
      docEl.innerHTML = "<p>Note not found: " + relPath + "</p>";
      return;
    }
    docEl.innerHTML = marked.parse(raw);
    setActiveLink(relPath);
    document.title =
      relPath.split("/").pop().replace(/\.md$/, "") + " — DevMind Notes";
    document.getElementById("content").scrollTo(0, 0);
    if (decodeURIComponent(location.hash.slice(1)) !== relPath) {
      history.replaceState(null, "", "#" + encodeURIComponent(relPath));
    }
  }

  function loadFromHash() {
    const hashPath = decodeURIComponent(location.hash.slice(1));
    loadFile(hashPath || DEFAULT_PATH);
  }

  // Case-insensitive subsequence fuzzy match. Every char of `query` must
  // appear in order in `text`; score rewards consecutive runs and matches
  // at the start of a word so tighter/earlier matches rank higher.
  function fuzzyMatch(query, text) {
    if (!query) return { matched: true, score: 0, indices: [] };
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    const indices = [];
    let qi = 0;
    let score = 0;
    let prevMatchIdx = -2;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        let charScore = 1;
        if (ti === prevMatchIdx + 1) charScore += 3;
        if (ti === 0 || t[ti - 1] === " ") charScore += 2;
        score += charScore;
        indices.push(ti);
        prevMatchIdx = ti;
        qi++;
      }
    }
    if (qi < q.length) return { matched: false, score: 0, indices: [] };
    // A subsequence existing isn't enough on its own — e.g. "monol"
    // trivially appears scattered across "normalization-denormalization"
    // even though that's not a relevant result. Reject matches whose
    // average per-character score is too low, i.e. too scattered/loose
    // to be a meaningful match, even though every character did match
    // in order.
    const MIN_AVG_SCORE = 2;
    if (score / q.length < MIN_AVG_SCORE)
      return { matched: false, score: 0, indices: [] };
    return { matched: true, score, indices };
  }

  function buildSearchIndex() {
    searchItems = [];
    const links = treeEl.querySelectorAll("a[data-path]");
    for (const link of links) {
      const path = link.dataset.path;
      // Match against the filename only, not the full ancestor path —
      // every note shares long folder prefixes (e.g. "system-design
      // concepts 04 architecture"), and matching against those lets a
      // greedy subsequence scanner consume query characters from the
      // shared prefix before ever reaching the actual filename, which
      // corrupts scoring for the file that should rank highest.
      const fileName = path.split("/").pop().replace(/\.md$/, "");
      const searchText = fileName.replace(/[_-]/g, " ");
      link.dataset.origText = link.textContent;
      searchItems.push({ link, li: link.closest("li"), searchText });
    }
  }

  function highlightLabel(link, indices) {
    const text = link.dataset.origText;
    if (!indices.length) {
      link.textContent = text;
      return;
    }
    const idxSet = new Set(indices);
    let html = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      html += idxSet.has(i) ? "<mark>" + ch + "</mark>" : ch;
    }
    link.innerHTML = html;
  }

  function restoreDetailsFromState() {
    const state = loadUIState();
    const expandedSet = new Set(state.expanded);
    const detailsEls = treeEl.querySelectorAll("details[data-path]");
    for (const d of detailsEls) {
      d.open = expandedSet.has(d.dataset.path);
    }
  }

  function applyFilter(query) {
    isFiltering = true;

    if (!query) {
      for (const item of searchItems) highlightLabel(item.link, []);
      const allLis = treeEl.querySelectorAll("li");
      for (const li of allLis) li.hidden = false;
      restoreDetailsFromState();
      isFiltering = false;
      return;
    }

    for (const item of searchItems) {
      const result = fuzzyMatch(query, item.searchText);
      item.li.hidden = !result.matched;
      if (result.matched) {
        const labelMatch = fuzzyMatch(query, item.link.dataset.origText);
        highlightLabel(item.link, labelMatch.matched ? labelMatch.indices : []);
      } else {
        highlightLabel(item.link, []);
      }
    }

    // Bottom-up: a folder is visible (and force-opened) only if it has
    // at least one visible descendant. Deepest folders first so parent
    // visibility can rely on already-resolved child state.
    const allDetails = Array.from(
      treeEl.querySelectorAll("details[data-path]"),
    );
    allDetails.sort(
      (a, b) =>
        b.dataset.path.split("/").length - a.dataset.path.split("/").length,
    );
    for (const d of allDetails) {
      const li = d.closest("li");
      const hasVisibleDescendant = Array.from(d.querySelectorAll("li")).some(
        (x) => !x.hidden,
      );
      li.hidden = !hasVisibleDescendant;
      if (hasVisibleDescendant) d.open = true;
    }

    isFiltering = false;
  }

  function setupSearch() {
    const searchInput = document.getElementById("tree-search");
    searchInput.addEventListener("input", () => {
      applyFilter(searchInput.value.trim());
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        applyFilter("");
        searchInput.blur();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const firstLink = treeEl.querySelector(
          "li:not([hidden]) > a[data-path]",
        );
        if (firstLink) firstLink.click();
      }
    });
  }

  function setupSidebarToggle(initialCollapsed) {
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (initialCollapsed) {
      document.body.classList.add("sidebar-collapsed");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
    toggleBtn.addEventListener("click", () => {
      const collapsed = document.body.classList.toggle("sidebar-collapsed");
      toggleBtn.setAttribute("aria-expanded", String(!collapsed));
      const state = loadUIState();
      state.sidebarCollapsed = collapsed;
      saveUIState(state);
    });
  }

  function init() {
    const uiState = loadUIState();
    const expandedSet = new Set(uiState.expanded);

    const initialHashPath =
      decodeURIComponent(location.hash.slice(1)) || DEFAULT_PATH;
    expandAncestors(initialHashPath, expandedSet);
    saveUIState({
      expanded: Array.from(expandedSet),
      sidebarCollapsed: uiState.sidebarCollapsed,
    });

    buildTree(window.NOTES_DATA.tree, treeEl, "", expandedSet);
    buildSearchIndex();
    setupSearch();
    setupSidebarToggle(uiState.sidebarCollapsed);
    window.addEventListener("hashchange", loadFromHash);
    loadFromHash();
  }

  init();
})();
