const KEY = "lumen-finance-data";
const THEME_KEY = "lumen-theme";
const colors = ["#a78bfa", "#f6a56c", "#73b9f6", "#77d5bd", "#64748b", "#f472b6"];
const defaultData = { accounts: [{ id: "bank", name: "Main account", type: "Checking", balance: 3240 }, { id: "savings", name: "Rainy day fund", type: "Savings", balance: 5800 }, { id: "cash", name: "Cash wallet", type: "Wallet", balance: 180 }], categories: [{ id: "groceries", name: "Groceries", type: "expense", color: colors[0] }, { id: "home", name: "Home & bills", type: "expense", color: colors[1] }, { id: "transport", name: "Transport", type: "expense", color: colors[2] }, { id: "leisure", name: "Leisure", type: "expense", color: colors[3] }, { id: "salary", name: "Salary", type: "income", color: colors[4] }], transactions: [{ id: "t1", date: "2026-09-14", description: "September salary", amount: 4850, type: "income", categoryId: "salary", accountId: "bank" }, { id: "t2", date: "2026-09-12", description: "Weekly groceries", amount: 86.42, type: "expense", categoryId: "groceries", accountId: "bank" }, { id: "t3", date: "2026-09-10", description: "Electricity bill", amount: 124.8, type: "expense", categoryId: "home", accountId: "bank" }, { id: "t4", date: "2026-09-08", description: "Train pass", amount: 58, type: "expense", categoryId: "transport", accountId: "bank" }, { id: "t5", date: "2026-09-06", description: "Dinner with friends", amount: 72.5, type: "expense", categoryId: "leisure", accountId: "cash" }, { id: "t6", date: "2026-09-02", description: "Farmers market", amount: 42.15, type: "expense", categoryId: "groceries", accountId: "cash" }] };
let data = JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultData);
let sort = { key: "date", direction: -1 };
const $ = (selector) => document.querySelector(selector);
const money = (value, compact = false) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 2 }).format(value);
const categoryById = (id) => data.categories.find((category) => category.id === id);
const accountById = (id) => data.accounts.find((account) => account.id === id);
const save = () => localStorage.setItem(KEY, JSON.stringify(data));
const id = () => crypto.randomUUID();

function renderSelects() {
  const categories = data.categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join("");
  $("#category-select").innerHTML = categories;
  $("#category-filter").innerHTML = `<option value="all">All categories</option>${categories}`;
  $("#account-select").innerHTML = data.accounts.map((account) => `<option value="${account.id}">${account.name}</option>`).join("");
}

function renderTransactions() {
  const query = $("#search-input").value.toLowerCase();
  const type = $("#type-filter").value;
  const category = $("#category-filter").value;
  const filtered = data.transactions.filter((item) => {
    const searchable = `${item.description} ${categoryById(item.categoryId)?.name || ""} ${accountById(item.accountId)?.name || ""}`.toLowerCase();
    return searchable.includes(query) && (type === "all" || item.type === type) && (category === "all" || item.categoryId === category);
  }).sort((a, b) => {
    const value = (item) => sort.key === "category" ? categoryById(item.categoryId)?.name : sort.key === "account" ? accountById(item.accountId)?.name : item[sort.key];
    return (value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0) * sort.direction;
  });
  const actions = document.body.dataset.page === "transactions";
  $("#transaction-list").innerHTML = filtered.map((item) => {
    const categoryItem = categoryById(item.categoryId); const account = accountById(item.accountId);
    return `<tr><td>${new Date(`${item.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: actions ? "numeric" : undefined })}</td><td class="description-cell">${item.description}</td><td><span class="category-pill"><i style="background:${categoryItem?.color || colors[0]}"></i>${categoryItem?.name || "Uncategorized"}</span></td><td>${account?.name || "Unknown"}</td><td class="amount-cell ${item.type === "income" ? "income-amount" : "expense-amount"}">${item.type === "income" ? "+" : "−"}${money(item.amount)}</td>${actions ? `<td><button class="table-action edit-action" data-id="${item.id}">Edit</button><button class="table-action delete-action" data-id="${item.id}">Delete</button></td>` : ""}</tr>`;
  }).join("");
  $("#empty-state").classList.toggle("hidden", filtered.length > 0);
}

function renderDashboard() {
  const income = data.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = data.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  $("#total-income").textContent = money(income); $("#total-expenses").textContent = money(expenses); $("#net-flow").textContent = money(income - expenses);
  $("#total-balance").textContent = money(data.accounts.reduce((sum, account) => sum + account.balance, 0)); $("#donut-total").textContent = money(expenses, true);
  $("#income-progress").style.width = `${Math.min(100, income / Math.max(income, expenses, 1) * 100)}%`;
  const spending = Object.entries(data.transactions.filter((item) => item.type === "expense").reduce((result, item) => { result[item.categoryId] = (result[item.categoryId] || 0) + item.amount; return result; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const spendingTotal = spending.reduce((sum, [, amount]) => sum + amount, 0);
  const donut = $("#donut-chart");
  if (donut && spendingTotal) {
    const radius = 50; const center = 60; let startAngle = -90;
    const segments = spending.map(([categoryId, amount]) => {
      const percentage = amount / spendingTotal; const endAngle = startAngle + percentage * 360; const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const point = (angle) => [center + radius * Math.cos(angle * Math.PI / 180), center + radius * Math.sin(angle * Math.PI / 180)];
      const start = point(startAngle); const end = point(endAngle);
      const path = `M ${center} ${center} L ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc} 1 ${end[0]} ${end[1]} Z`;
      startAngle = endAngle;
      return `<path class="donut-segment" data-label="${categoryById(categoryId)?.name || "Other"} · ${money(amount)} · ${Math.round(percentage * 100)}%" d="${path}" fill="${categoryById(categoryId)?.color || colors[0]}"><title>${categoryById(categoryId)?.name || "Other"}: ${money(amount)} (${Math.round(percentage * 100)}%)</title></path>`;
    }).join("");
    donut.innerHTML = `<svg class="donut-svg" viewBox="0 0 120 120" aria-hidden="true">${segments}</svg><div class="donut-hover-label"></div><div class="donut-center"><strong id="donut-total">${money(expenses, true)}</strong><span>spent</span></div>`;
    donut.querySelectorAll(".donut-segment").forEach((segment) => {
      segment.addEventListener("mouseenter", () => { const label = donut.querySelector(".donut-hover-label"); label.textContent = segment.dataset.label; label.classList.add("visible"); });
      segment.addEventListener("mouseleave", () => donut.querySelector(".donut-hover-label").classList.remove("visible"));
    });
  }
  $("#category-list").innerHTML = spending.map(([categoryId, amount]) => `<div class="category-row" data-tooltip="${categoryById(categoryId)?.name || "Other"} · ${money(amount)} · ${spendingTotal ? Math.round(amount / spendingTotal * 100) : 0}%"><i class="category-color" style="background:${categoryById(categoryId)?.color || colors[0]}"></i><span>${categoryById(categoryId)?.name || "Other"}</span><span class="category-amount">${money(amount)}</span></div>`).join("") || `<div class="category-row">No spending recorded yet.</div>`;
  $("#account-list").innerHTML = data.accounts.map((account, index) => `<div class="account-row"><div class="account-icon">${index === 0 ? "◉" : index === 1 ? "◌" : "◇"}</div><div class="account-meta"><strong>${account.name}</strong><span>${account.type}</span></div><span class="account-balance">${money(account.balance)}</span></div>`).join("");
  const months = []; const now = new Date(); const period = Number($("#period-select")?.value || 6);
  for (let index = period - 1; index >= 0; index -= 1) { const date = new Date(now.getFullYear(), now.getMonth() - index, 1); months.push({ key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, label: date.toLocaleDateString("en-US", { month: "short" }) }); }
  const totals = months.map((month) => data.transactions.reduce((result, item) => { if (item.date.startsWith(month.key)) result[item.type] += item.amount; return result; }, { income: 0, expense: 0 }));
  const max = Math.max(...totals.flatMap((item) => [item.income, item.expense]), 1);
  $("#bar-chart").innerHTML = months.map((month, index) => `<div class="month-bars" data-tooltip="${month.label} · Income ${money(totals[index].income)} · Expenses ${money(totals[index].expense)}"><span class="bar income" style="height:${Math.max(3, totals[index].income / max * 100)}%"></span><span class="bar expense" style="height:${Math.max(3, totals[index].expense / max * 100)}%"></span><span class="month-label">${month.label}</span></div>`).join("");
}

function renderCategoryManager() {
  const manager = $("#category-manager-list");
  if (!manager) return;
  manager.innerHTML = data.categories.map((category) => `<div class="managed-category"><span class="category-pill"><i style="background:${category.color}"></i>${category.name}<small>${category.type}</small></span><span class="managed-category-actions"><button type="button" class="category-edit" data-id="${category.id}">Edit</button><button type="button" class="category-delete" data-id="${category.id}">Delete</button></span></div>`).join("");
}

function openTransaction(transactionId = "") {
  const item = data.transactions.find((transaction) => transaction.id === transactionId);
  $("#editing-id").value = transactionId; $("#transaction-title").textContent = item ? "Edit transaction" : "Add transaction";
  $("#description").value = item?.description || ""; $("#amount").value = item?.amount || ""; $("#date").value = item?.date || new Date().toISOString().slice(0, 10);
  $("#transaction-type").value = item?.type || "expense"; document.querySelectorAll(".flow-option").forEach((button) => button.classList.toggle("active", button.dataset.type === (item?.type || "expense")));
  renderSelects(); if (item) { $("#account-select").value = item.accountId; $("#category-select").value = item.categoryId; } openModal("transaction-modal");
}
function openModal(id) { $(`#${id}`).classList.remove("hidden"); }
function closeModal(id) { $(`#${id}`).classList.add("hidden"); }
function adjustBalance(accountId, amount, type) { const account = accountById(accountId); if (account) account.balance += type === "income" ? amount : -amount; }

function setup() {
  const today = new Date(); if ($("#today-label")) $("#today-label").textContent = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  renderSelects(); if (document.body.dataset.page !== "transactions") renderDashboard(); renderTransactions();
  document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => { sort = { key: button.dataset.sort, direction: sort.key === button.dataset.sort ? sort.direction * -1 : 1 }; renderTransactions(); }));
  ["search-input", "type-filter", "category-filter"].forEach((field) => $(`#${field}`).addEventListener("input", renderTransactions));
  $("#period-select")?.addEventListener("change", renderDashboard);
  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.close)));
  $("#open-transaction")?.addEventListener("click", () => openTransaction());
  document.querySelectorAll(".flow-option").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".flow-option").forEach((item) => item.classList.remove("active")); button.classList.add("active"); $("#transaction-type").value = button.dataset.type; }));
  $("#transaction-list").addEventListener("click", (event) => { const transactionId = event.target.dataset.id; if (event.target.classList.contains("edit-action")) openTransaction(transactionId); if (event.target.classList.contains("delete-action") && confirm("Delete this transaction?")) { const item = data.transactions.find((transaction) => transaction.id === transactionId); adjustBalance(item.accountId, item.amount, item.type === "income" ? "expense" : "income"); data.transactions = data.transactions.filter((transaction) => transaction.id !== transactionId); save(); renderAll(); } });
  $("#transaction-form").addEventListener("submit", (event) => { event.preventDefault(); const transactionType = $("#transaction-type").value; const amount = Number($("#amount").value); const editingId = $("#editing-id").value; const next = { id: editingId || id(), date: $("#date").value, description: $("#description").value.trim(), amount, type: transactionType, categoryId: $("#category-select").value, accountId: $("#account-select").value }; const old = data.transactions.find((transaction) => transaction.id === editingId); if (old) { adjustBalance(old.accountId, old.amount, old.type === "income" ? "expense" : "income"); data.transactions[data.transactions.indexOf(old)] = next; } else data.transactions.unshift(next); adjustBalance(next.accountId, next.amount, next.type); save(); renderAll(); closeModal("transaction-modal"); });
  $("#category-form")?.addEventListener("submit", (event) => { event.preventDefault(); const editingId = $("#category-editing-id").value; const name = $("#category-name").value.trim(); if (!name) return; const existing = data.categories.find((category) => category.id === editingId); if (existing) { existing.name = name; existing.type = $("#category-type").value; } else data.categories.push({ id: id(), name, type: $("#category-type").value, color: colors[data.categories.length % colors.length] }); save(); renderAll(); event.target.reset(); $("#category-editing-id").value = ""; $("#category-title").textContent = "Add a category"; $("#category-submit").textContent = "Add category"; $("#cancel-category-edit").classList.add("hidden"); });
  $("#category-manager-list")?.addEventListener("click", (event) => { const categoryId = event.target.dataset.id; const category = data.categories.find((item) => item.id === categoryId); if (!category) return; if (event.target.classList.contains("category-edit")) { $("#category-editing-id").value = category.id; $("#category-name").value = category.name; $("#category-type").value = category.type; $("#category-title").textContent = "Edit category"; $("#category-submit").textContent = "Save changes"; $("#cancel-category-edit").classList.remove("hidden"); $("#category-name").focus(); } if (event.target.classList.contains("category-delete")) { const inUse = data.transactions.some((transaction) => transaction.categoryId === categoryId); if (inUse) { alert("This category is used by a transaction. Update those transactions before deleting it."); return; } if (confirm(`Delete ${category.name}?`)) { data.categories = data.categories.filter((item) => item.id !== categoryId); save(); renderAll(); } } });
  $("#cancel-category-edit")?.addEventListener("click", () => { $("#category-form").reset(); $("#category-editing-id").value = ""; $("#category-title").textContent = "Add a category"; $("#category-submit").textContent = "Add category"; $("#cancel-category-edit").classList.add("hidden"); });
  const openCategories = () => { renderCategoryManager(); openModal("category-modal"); };
  $("#manage-categories")?.addEventListener("click", openCategories);
  $("#categories-nav")?.addEventListener("click", (event) => { event.preventDefault(); openCategories(); history.replaceState(null, "", "#categories"); });
  $("#open-account")?.addEventListener("click", () => openModal("account-modal")); $("#open-account-bottom")?.addEventListener("click", () => openModal("account-modal"));
  $("#account-form")?.addEventListener("submit", (event) => { event.preventDefault(); data.accounts.push({ id: id(), name: $("#account-name").value.trim(), type: $("#account-type").value, balance: Number($("#starting-balance").value) }); save(); renderAll(); event.target.reset(); closeModal("account-modal"); });
  $("#clear-data")?.addEventListener("click", () => { if (confirm("Reset all demo data? This cannot be undone.")) { data = structuredClone(defaultData); save(); renderAll(); } });
  const theme = localStorage.getItem(THEME_KEY) || "dark"; document.documentElement.dataset.theme = theme; updateThemeButton(); renderCategoryManager();
  if (new URLSearchParams(window.location.search).get("openCategories") === "1") openCategories();
  $("#theme-toggle")?.addEventListener("click", () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === "light" ? "dark" : "light"; localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme); updateThemeButton(); });
}
function updateThemeButton() { const button = $("#theme-toggle"); if (button) button.innerHTML = document.documentElement.dataset.theme === "light" ? "<span>☾</span> Dark theme" : "<span>☼</span> Light theme"; }
function renderAll() { renderSelects(); renderTransactions(); if (document.body.dataset.page !== "transactions") renderDashboard(); renderCategoryManager(); }
setup();
