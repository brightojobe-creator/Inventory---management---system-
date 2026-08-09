const state = { token: localStorage.getItem("inventoryToken"), user: JSON.parse(localStorage.getItem("inventoryUser") || "null") };

const $ = (id) => document.getElementById(id);
function headers() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${state.token}` };
}
function showAlert(message, type = "info") {
  $("alert").innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => $("alert").innerHTML = "", 3500);
}
async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function setLoggedIn() {
  $("authView").classList.toggle("d-none", !!state.token);
  $("registerView").classList.add("d-none");
  $("appView").classList.toggle("d-none", !state.token);
  $("logoutBtn").classList.toggle("d-none", !state.token);
  if (state.token) {
    $("welcome").textContent = `Welcome, ${state.user?.name || "User"}`;
    loadAll();
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("/api/auth/login", {
      method: "POST", body: JSON.stringify({ email: $("loginEmail").value, password: $("loginPassword").value })
    });
    state.token = data.token; state.user = data.user;
    localStorage.setItem("inventoryToken", state.token);
    localStorage.setItem("inventoryUser", JSON.stringify(state.user));
    setLoggedIn(); showAlert("Login successful", "success");
  } catch (err) { showAlert(err.message, "danger"); }
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: $("regName").value, email: $("regEmail").value, password: $("regPassword").value })
    });
    state.token = data.token; state.user = data.user;
    localStorage.setItem("inventoryToken", state.token);
    localStorage.setItem("inventoryUser", JSON.stringify(state.user));
    setLoggedIn(); showAlert("Account created", "success");
  } catch (err) { showAlert(err.message, "danger"); }
});

$("showRegister").onclick = () => { $("authView").classList.add("d-none"); $("registerView").classList.remove("d-none"); };
$("showLogin").onclick = () => { $("registerView").classList.add("d-none"); $("authView").classList.remove("d-none"); };
$("logoutBtn").onclick = () => {
  localStorage.removeItem("inventoryToken"); localStorage.removeItem("inventoryUser");
  state.token = null; state.user = null; setLoggedIn();
};

async function loadDashboard() {
  const d = (await api("/api/dashboard")).data;
  $("statProducts").textContent = d.products;
  $("statCategories").textContent = d.categories;
  $("statSuppliers").textContent = d.suppliers;
  $("statStock").textContent = d.stock;
  $("statLow").textContent = d.lowStock;
}
async function loadCategories() {
  const data = (await api("/api/categories")).data;
  $("categoryFilter").innerHTML = '<option value="">All categories</option>' +
    data.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  $("pCategory").innerHTML = data.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
}
async function loadSuppliers() {
  const data = (await api("/api/suppliers")).data;
  $("pSupplier").innerHTML = data.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("");
}
async function loadProducts() {
  const search = encodeURIComponent($("search").value);
  const category = encodeURIComponent($("categoryFilter").value);
  const data = (await api(`/api/products?search=${search}&category=${category}`)).data;
  $("productsTable").innerHTML = data.map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.sku)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td>₦${Number(p.price).toLocaleString()}</td>
      <td class="${p.quantity <= p.reorder_level ? "low-stock text-danger" : ""}">${p.quantity}</td>
      <td>${escapeHtml(p.supplier)}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary" onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button class="btn btn-sm btn-outline-success" onclick="adjustStock(${p.id}, 'IN')">+ Stock</button>
        <button class="btn btn-sm btn-outline-warning" onclick="adjustStock(${p.id}, 'OUT')">- Stock</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>`).join("");
}
async function loadAll() {
  try { await Promise.all([loadDashboard(), loadCategories(), loadSuppliers(), loadProducts()]); }
  catch (err) { showAlert(err.message, "danger"); }
}
function openProductModal() {
  $("productForm").reset(); $("productId").value = ""; $("pReorder").value = 5;
  $("productModalTitle").textContent = "Add Product";
}
function editProduct(p) {
  $("productId").value = p.id; $("pName").value = p.name; $("pSku").value = p.sku;
  $("pPrice").value = p.price; $("pQuantity").value = p.quantity; $("pReorder").value = p.reorder_level;
  $("pCategory").value = p.category_id; $("pSupplier").value = p.supplier_id;
  $("productModalTitle").textContent = "Edit Product";
  bootstrap.Modal.getOrCreateInstance($("productModal")).show();
}
$("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("productId").value;
  const payload = {
    name: $("pName").value, sku: $("pSku").value, price: Number($("pPrice").value),
    quantity: Number($("pQuantity").value), reorder_level: Number($("pReorder").value),
    category_id: Number($("pCategory").value), supplier_id: Number($("pSupplier").value)
  };
  try {
    await api(id ? `/api/products/${id}` : "/api/products", {
      method: id ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    bootstrap.Modal.getOrCreateInstance($("productModal")).hide();
    showAlert(id ? "Product updated" : "Product added", "success");
    loadAll();
  } catch (err) { showAlert(err.message, "danger"); }
});
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try { await api(`/api/products/${id}`, { method: "DELETE" }); showAlert("Product deleted", "success"); loadAll(); }
  catch (err) { showAlert(err.message, "danger"); }
}
async function adjustStock(id, type) {
  const value = prompt(`Enter quantity to ${type === "IN" ? "add" : "remove"}:`);
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) return;
  const note = prompt("Optional note:") || "";
  try {
    await api("/api/stock/adjust", {
      method: "POST", body: JSON.stringify({ product_id: id, type, quantity, note })
    });
    showAlert("Stock updated", "success"); loadAll();
  } catch (err) { showAlert(err.message, "danger"); }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}
$("search").addEventListener("input", loadProducts);
$("categoryFilter").addEventListener("change", loadProducts);
setLoggedIn();
