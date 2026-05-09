const form = document.querySelector("#form");
const input = document.querySelector("#text");
const listEl = document.querySelector("#list");
const emptyEl = document.querySelector("#empty");
const filterBar = document.querySelector(".filters");

/** @type {{ id: string, text: string, done: boolean }[]} */
let todos = [];
/** @type {"all"|"active"|"done"} */
let filter = "all";

const KEY = "todos-sample-v1";

function uid() {
  return crypto.randomUUID();
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function visible(t) {
  if (filter === "active") return !t.done;
  if (filter === "done") return t.done;
  return true;
}

function rowTemplate(t) {
  return `<li data-id="${t.id}">
    <label>
      <input type="checkbox" ${t.done ? "checked" : ""} />
      <span>${escapeHtml(t.text)}</span>
    </label>
    <button type="button" data-action="delete" aria-label="Delete">×</button>
  </li>`;
}

function render() {
  const items = todos.filter(visible);
  listEl.innerHTML = items.map(rowTemplate).join("");
  emptyEl.hidden = items.length !== 0 || todos.length === 0;
  filterBar.querySelectorAll("button").forEach((btn) => {
    const f = btn.getAttribute("data-filter");
    btn.setAttribute("aria-pressed", String(f === filter));
  });
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch {
    todos = [];
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos = [...todos, { id: uid(), text, done: false }];
  input.value = "";
  render();
  save();
});

listEl.addEventListener("click", (e) => {
  const target = e.target;
  const li = target.closest("li");
  if (!li) return;
  const id = li.getAttribute("data-id");
  if (target.matches("input[type=checkbox]")) {
    todos = todos.map((t) =>
      t.id === id ? { ...t, done: target.checked } : t,
    );
    render();
    save();
  }
  if (target.matches("button[data-action=delete]")) {
    todos = todos.filter((t) => t.id !== id);
    render();
    save();
  }
});

filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  filter = /** @type {any} */ (btn.getAttribute("data-filter"));
  render();
});

load();
render();
