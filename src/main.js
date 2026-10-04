import { scroll } from "motion";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
Promise.all([
  import("@uppercut-labs/dreamcast-backgrounds"),
  import("@uppercut-labs/dreamcast-backgrounds/scenes/neon-drift-interchange"),
]).then(([{ createBackground }, { default: scene }]) => {
  createBackground({ element: "#world", scene, motion: reduceMotion ? "still" : "ambient", quality: "auto" });
});

const stack = [
  { tool: "Website builder", swap: "Static hosting", before: 39, after: 0 },
  { tool: "Email marketing", swap: "Pay-per-send email", before: 65, after: 15 },
  { tool: "Analytics", swap: "Self-hosted analytics", before: 50, after: 0 },
  { tool: "Form builder", swap: "Native forms", before: 29, after: 0 },
  { tool: "Scheduling", swap: "Calendar booking page", before: 16, after: 0 },
  { tool: "CRM", swap: "Lean CRM", before: 45, after: 12 },
  { tool: "Team wiki", swap: "Docs in your repo", before: 24, after: 8 },
];

const totalBefore = stack.reduce((s, r) => s + r.before, 0);
const totalAfter = stack.reduce((s, r) => s + r.after, 0);
const maxRow = Math.max(...stack.map((r) => r.before));
const maxSaved = (totalBefore - totalAfter) * 12;

const rowsEl = document.getElementById("rows");
const rows = stack.map((r) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="row-label">
      <span class="tool">${r.tool}</span>
      <span class="swap">${r.swap}</span>
    </div>
    <div class="track"><i></i></div>
    <strong class="cost">$${r.before}</strong>`;
  rowsEl.append(li);
  return { ...r, li, bar: li.querySelector("i"), cost: li.querySelector(".cost") };
});

const spend = document.getElementById("spend");
const spendBar = document.getElementById("spend-bar");
const saved = document.getElementById("saved");
const savedBar = document.getElementById("saved-bar");
const target = document.querySelector(".target");
target.style.left = `${(50 / totalBefore) * 100}%`;

const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const money = (n) => `$${Math.round(n).toLocaleString()}`;

function render(progress) {
  // Rows cut one after another across the first 85% of the scroll.
  const span = 0.85 / rows.length;
  let monthly = 0;
  rows.forEach((r, i) => {
    const t = ease(clamp((progress - i * span) / (span * 1.6)));
    const cost = r.before + (r.after - r.before) * t;
    monthly += cost;
    r.bar.style.transform = `scaleX(${cost / maxRow})`;
    r.cost.textContent = money(cost);
    r.li.classList.toggle("is-cut", t >= 1);
    r.li.style.setProperty("--swap", t);
  });
  spend.textContent = money(monthly);
  spendBar.style.transform = `scaleX(${monthly / totalBefore})`;
  spendBar.parentElement.classList.toggle("under", monthly < 50);
  const year = (totalBefore - monthly) * 12;
  saved.textContent = money(year);
  savedBar.style.transform = `scaleX(${year / maxSaved})`;
}

const ledger = document.getElementById("ledger");
render(0);
scroll((progress) => render(progress), { target: ledger, offset: ["start start", "end end"] });
