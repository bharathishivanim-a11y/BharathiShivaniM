/* ===== dashboard.js =====
   The main page. It:
   1. Loads contacts from the API (GET) — or from localStorage if we already have them
   2. Shows them in a table
   3. Lets you add (POST), edit (PUT) and delete (DELETE) contacts
   4. Lets you search and sort the table
   5. Keeps everything in localStorage so it survives a page refresh
*/

setupNavbar(); // from auth.js: redirects to login if not logged in

/* ---------- State (the data the page is showing) ---------- */
const USERS_KEY = "users";   // localStorage key for the contact list
const SEARCH_KEY = "lastSearch";

let users = [];          // all contacts
let editingId = null;    // null = adding a new contact, a number = editing that contact
let sortAscending = true;

/* ---------- Elements ---------- */
const tableBody = document.getElementById("tableBody");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const sortNameHeader = document.getElementById("sortName");

const userForm = document.getElementById("userForm");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const userFormMessage = document.getElementById("userFormMessage");

const fields = {
  name: document.getElementById("name"),
  email: document.getElementById("userEmail"),
  phone: document.getElementById("phone"),
  city: document.getElementById("city"),
};

/* ---------- localStorage helpers ---------- */
function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function loadSavedUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : null;
}

/* ---------- Loading data ---------- */

// forceApi = true when the "Reload from API" button is clicked
async function loadUsers(forceApi = false) {
  const saved = loadSavedUsers();

  if (saved && !forceApi) {
    users = saved;
    showStatus("Loaded " + users.length + " contacts from localStorage");
    renderTable();
    return;
  }

  showStatus("Fetching contacts from the API...");
  refreshBtn.disabled = true;
  try {
    const apiUsers = await api.getUsers(); // GET request
    // Keep only the fields we need (the API sends a lot more)
    users = apiUsers.map(function (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        city: u.address ? u.address.city : "",
        company: u.company ? u.company.name : "",
      };
    });
    saveUsers();
    showStatus("GET ✔ Loaded " + users.length + " contacts from " + api.source);
  } catch (error) {
    showStatus("Could not load contacts: " + error.message);
  }
  refreshBtn.disabled = false;
  renderTable();
}

/* ---------- Showing the table ---------- */

function renderTable() {
  const term = searchInput.value.trim().toLowerCase();

  // 1. SEARCH: keep contacts whose name, email or city contains the search term
  let visible = users.filter(function (u) {
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.city.toLowerCase().includes(term)
    );
  });

  // 2. SORT by name (A→Z or Z→A)
  visible.sort(function (a, b) {
    return sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  // 3. Build the rows
  tableBody.innerHTML = ""; // clear old rows

  if (visible.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 6;
    cell.className = "empty";
    cell.textContent = term ? 'No contacts match "' + term + '"' : "No contacts yet";
    return;
  }

  visible.forEach(function (u) {
    const row = tableBody.insertRow();
    // textContent (not innerHTML) so typed text can never run as HTML/script
    row.insertCell().textContent = u.name;
    row.insertCell().textContent = u.email;
    row.insertCell().textContent = u.phone;
    row.insertCell().textContent = u.city;
    row.insertCell().textContent = u.company || "—";

    const actions = row.insertCell();
    actions.className = "actions";
    actions.appendChild(makeButton("Edit", "edit", u.id, "btn small secondary"));
    actions.appendChild(document.createTextNode(" "));
    actions.appendChild(makeButton("Delete", "delete", u.id, "btn small danger"));
  });
}

// Creates a button that remembers which action and which contact it is for
function makeButton(text, action, id, className) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = className;
  btn.dataset.action = action; // becomes data-action="edit"
  btn.dataset.id = id;         // becomes data-id="3"
  return btn;
}

function showStatus(message) {
  statusEl.textContent = message;
}

/* ---------- Form validation ---------- */

function validateForm() {
  let ok = true;
  const name = fields.name.value.trim();
  const email = fields.email.value.trim();
  const phone = fields.phone.value.trim();
  const city = fields.city.value.trim();

  ok = check(fields.name, "nameError", name.length >= 3, "Name must be at least 3 characters") && ok;
  ok = check(fields.email, "userEmailError", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Enter a valid email") && ok;
  // phone: at least 10 digits (spaces, dashes etc. allowed)
  ok = check(fields.phone, "phoneError", phone.replace(/\D/g, "").length >= 10, "Phone needs at least 10 digits") && ok;
  ok = check(fields.city, "cityError", city !== "", "City is required") && ok;

  return ok;
}

// Shows/clears one field's error depending on `condition`
function check(input, errorId, condition, message) {
  const errorEl = document.getElementById(errorId);
  input.classList.toggle("invalid", !condition);
  errorEl.textContent = condition ? "" : message;
  return condition;
}

/* ---------- Add / Edit ---------- */

function startEdit(id) {
  const user = users.find((u) => u.id === id);
  if (!user) return;

  editingId = id;
  fields.name.value = user.name;
  fields.email.value = user.email;
  fields.phone.value = user.phone;
  fields.city.value = user.city;

  formTitle.textContent = "Edit contact";
  saveBtn.textContent = "Save changes";
  cancelEditBtn.hidden = false;
  userFormMessage.textContent = "";
  fields.name.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  userForm.reset();
  Object.values(fields).forEach((input) => input.classList.remove("invalid"));
  document.querySelectorAll("#userForm .error").forEach((el) => (el.textContent = ""));
  formTitle.textContent = "Add a contact";
  saveBtn.textContent = "Add contact";
  cancelEditBtn.hidden = true;
}

function showFormMessage(text, isError) {
  userFormMessage.className = "form-message " + (isError ? "error-msg" : "success-msg");
  userFormMessage.textContent = text;
}

/* ---------- Events ---------- */

// EVENT "submit" on the add/edit form
userForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!validateForm()) return;

  const formData = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    city: fields.city.value.trim(),
  };

  saveBtn.disabled = true;

  if (editingId === null) {
    // ---- ADD (POST) ----
    try {
      await api.addUser(formData);
      // The fake API always answers id 11, so we make our own unique id
      users.push({ ...formData, company: "", id: Date.now() });
      showFormMessage("POST ✔ Contact added", false);
    } catch (error) {
      showFormMessage("Could not add: " + error.message, true);
    }
  } else {
    // ---- EDIT (PUT) ----
    const index = users.findIndex((u) => u.id === editingId);
    let message = "PUT ✔ Contact updated";
    try {
      await api.updateUser(editingId, formData);
    } catch (error) {
      // JSONPlaceholder only knows ids 1-10, so PUT on contacts we added fails there.
      message = "Saved locally (fake API rejected PUT: " + error.message + ")";
    }
    users[index] = { ...users[index], ...formData };
    showFormMessage(message, false);
  }

  saveUsers();
  saveBtn.disabled = false;
  resetForm();
  renderTable();
});

// EVENT "click" on Cancel edit
cancelEditBtn.addEventListener("click", function () {
  resetForm();
  userFormMessage.textContent = "";
});

// EVENT "click" on the table — ONE listener handles every Edit/Delete button.
// This is called EVENT DELEGATION: the click "bubbles up" from the button to the tbody.
tableBody.addEventListener("click", async function (event) {
  const button = event.target.closest("button");
  if (!button) return; // clicked somewhere that isn't a button

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    startEdit(id);
  }

  if (action === "delete") {
    const user = users.find((u) => u.id === id);
    if (!confirm("Delete " + user.name + "?")) return;

    button.disabled = true;
    try {
      await api.deleteUser(id); // DELETE request
      showStatus("DELETE ✔ Removed " + user.name);
    } catch (error) {
      showStatus("Removed locally (API said: " + error.message + ")");
    }
    users = users.filter((u) => u.id !== id);
    saveUsers();
    if (editingId === id) resetForm();
    renderTable();
  }
});

// EVENT "input" on the search box -> filter while typing, and remember the term
searchInput.addEventListener("input", function () {
  localStorage.setItem(SEARCH_KEY, searchInput.value);
  renderTable();
});

// EVENT "click" on the Name header -> toggle sort order
sortNameHeader.addEventListener("click", function () {
  sortAscending = !sortAscending;
  sortNameHeader.textContent = "Name " + (sortAscending ? "↑" : "↓");
  renderTable();
});

// EVENT "click" on Reload -> ignore localStorage and GET fresh data
refreshBtn.addEventListener("click", function () {
  if (confirm("Reload from the API? Your local changes will be replaced.")) {
    loadUsers(true);
  }
});

/* ---------- Start ---------- */
searchInput.value = localStorage.getItem(SEARCH_KEY) || ""; // restore last search
loadUsers();
