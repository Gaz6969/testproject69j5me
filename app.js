const LETTER_CODES = {
  A: "00",
  B: "0101",
  C: "1110",
  D: "011",
  E: "0",
  F: "0001",
  G: "0010",
  H: "001",
  I: "11",
  J: "1101",
  K: "1011",
  L: "110",
  M: "1010",
  N: "100",
  O: "01",
  P: "0100",
  Q: "1100",
  R: "010",
  S: "000",
  T: "10",
  U: "1111",
  V: "0110",
  W: "0000",
  X: "1001",
  Y: "0011",
  Z: "10100"
};

const COMMIT_DELAY_MS = 900;

const pathEl = document.getElementById("path");
const currentLetterEl = document.getElementById("current-letter");
const typedTextEl = document.getElementById("typed-text");
const clearBtn = document.getElementById("clear-btn");
const treeEl = document.getElementById("tree");
const codesEl = document.getElementById("codes");

let currentPath = "";
let typedLetters = [];
let commitTimer;

function buildTree() {
  const root = { left: null, right: null, letter: null, path: "" };

  for (const [letter, code] of Object.entries(LETTER_CODES)) {
    let node = root;
    for (const bit of code) {
      if (bit === "0") {
        node.left ??= { left: null, right: null, letter: null, path: `${node.path}0` };
        node = node.left;
      } else {
        node.right ??= { left: null, right: null, letter: null, path: `${node.path}1` };
        node = node.right;
      }
    }
    node.letter = letter;
  }

  return root;
}

const tree = buildTree();

function findNode(path) {
  let node = tree;
  for (const bit of path) {
    node = bit === "0" ? node.left : node.right;
    if (!node) return null;
  }
  return node;
}

function renderTree(node, container) {
  if (!node) return;

  const li = document.createElement("li");
  li.dataset.path = node.path;

  const header = document.createElement("div");
  header.className = "node";
  header.innerHTML = `<span class="path">${node.path || "(root)"}</span> <span>${node.letter || "·"}</span>`;
  li.appendChild(header);

  const children = [node.left, node.right].filter(Boolean);
  if (children.length) {
    const ul = document.createElement("ul");
    for (const child of children) renderTree(child, ul);
    li.appendChild(ul);
  }

  container.appendChild(li);
}

function renderCodes() {
  const fragment = document.createDocumentFragment();
  Object.entries(LETTER_CODES)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([letter, code]) => {
      const cell = document.createElement("div");
      cell.textContent = `${letter}: ${code}`;
      fragment.appendChild(cell);
    });
  codesEl.appendChild(fragment);
}

function highlightCurrentPath() {
  treeEl.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
  const active = treeEl.querySelector(`[data-path="${currentPath}"]`);
  if (active) active.classList.add("active");
}

function updateStatus() {
  const node = findNode(currentPath);
  pathEl.textContent = currentPath || "(root)";
  currentLetterEl.textContent = node?.letter ?? "-";
  typedTextEl.textContent = typedLetters.join("");
  highlightCurrentPath();
}

function commitLetter() {
  const node = findNode(currentPath);
  if (node?.letter) {
    typedLetters.push(node.letter);
  }
  currentPath = "";
  updateStatus();
}

function restartCommitTimer() {
  clearTimeout(commitTimer);
  commitTimer = setTimeout(commitLetter, COMMIT_DELAY_MS);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();

  const nextBit = event.key === "ArrowLeft" ? "0" : "1";
  const candidatePath = `${currentPath}${nextBit}`;

  if (findNode(candidatePath)) {
    currentPath = candidatePath;
  }

  updateStatus();
  restartCommitTimer();
});

clearBtn.addEventListener("click", () => {
  typedLetters = [];
  currentPath = "";
  clearTimeout(commitTimer);
  updateStatus();
});

renderTree(tree, treeEl);
renderCodes();
updateStatus();
