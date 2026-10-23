# 📇 Contact Manager

A small web app that covers every point of the task using **plain HTML, CSS and JavaScript**, plus the same table rebuilt in **Vue** and **React** for comparison.

Demo login: **admin@test.com** / **Admin@123**

---

## ▶️ How to run

1. Open the folder in **VS Code**.
2. Install the **Live Server** extension → right-click `index.html` → **Open with Live Server**.
   (Double-clicking `index.html` also works, but Live Server is better.)
3. Log in with the demo account.

Needs internet for the real API and for the Vue/React CDN files. Without internet, the plain JS pages automatically switch to the mock API.

---

## ✅ Requirement checklist — where each one is

| Requirement | Where | What to show |
|---|---|---|
| **API call (public + mock)** | `js/api.js` | Real API = JSONPlaceholder. Mock API = fake functions with `setTimeout`. Auto-fallback if offline. |
| **Specific methods (GET/POST/PUT/DELETE)** | `js/api.js`, used in `js/dashboard.js` | Load = GET, Add = POST, Edit = PUT, Delete = DELETE. Status line shows `GET ✔`, `POST ✔`… |
| **Login page** | `index.html`, `js/login.js` | Login, Show/Hide password, Remember me |
| **Form validation of login** | `js/login.js` → `validateEmail()`, `validatePassword()` | Empty fields, bad email, short password, no number, wrong credentials |
| **Tables displayed** | `dashboard.html`, `renderTable()` in `js/dashboard.js` | Rows built with JS, Edit/Delete per row, click "Name" to sort |
| **Local storage** | everywhere | See "localStorage keys" below |
| **Buttons with events** | all JS files (search for `addEventListener`) | See "Events" table below |
| **Different framework experimentation** | `frameworks/vue.html`, `frameworks/react.html` | Same table + search + delete, 3 ways |
| **Search** | search box on dashboard, Vue and React pages | Filters by name, email or city while typing |
| **Contact** | `contact.html`, `js/contact.js` | Contact form with validation, messages saved and listed |
| **Styling** | `css/style.css` | CSS variables, flexbox/grid, hover effects, responsive |

---

## 📁 Files

```
contact-manager/
├── index.html          Login page
├── dashboard.html      Contacts table + add/edit form + search
├── contact.html        Contact Us form + saved messages
├── css/style.css       One stylesheet for everything
├── js/
│   ├── auth.js         Session helpers: login check, logout, navbar
│   ├── login.js        Login validation + localStorage
│   ├── api.js          ALL server calls (real API + mock API)
│   ├── dashboard.js    Table, search, sort, add/edit/delete
│   └── contact.js      Contact form validation + saved messages
└── frameworks/
    ├── vue.html        Same table in Vue 3
    └── react.html      Same table in React 18
```

**Script order matters:** `auth.js` → `api.js` → page script, because the page script uses functions defined in the first two.

---

## 🔁 How the app flows

1. **Login** (`index.html`) → JS validates → if correct, saves `session` in localStorage → goes to dashboard.
2. **Every other page** calls `setupNavbar()` → if there is no `session`, it sends you back to login. (This is a "route guard".)
3. **Dashboard** → if `users` already exists in localStorage, it shows those; otherwise it does a **GET** to the API and saves the result.
4. **Add / Edit / Delete** → sends POST / PUT / DELETE to the API → updates the array → saves to localStorage → redraws the table.
5. **Logout** → removes `session` → back to login.

---

## 🌐 The API (`js/api.js`)

**JSONPlaceholder** (`https://jsonplaceholder.typicode.com/users`) is a free fake REST API. It answers GET, POST, PUT and DELETE like a real server **but doesn't actually save changes**. That's why we keep our own copy in localStorage.

```js
// GET
const response = await fetch(API_URL);
const users = await response.json();

// POST (PUT is the same with method "PUT" and URL + "/" + id)
await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // tells the server we're sending JSON
  body: JSON.stringify(user),                      // object -> text
});

// DELETE
await fetch(API_URL + "/" + id, { method: "DELETE" });
```

| Method | Meaning | Used when |
|---|---|---|
| GET | Read data | Page loads / Reload button |
| POST | Create new | Add contact |
| PUT | Replace existing | Save changes after Edit |
| DELETE | Remove | Delete button |

**Mock API:** same function names, but returns hard-coded data after a delay using `setTimeout` inside a `Promise`. Set `USE_MOCK_API = true` to use it always. It's also used automatically when the real API can't be reached (`try/catch` in `api.getUsers`).

**Two quirks of the fake API (good to mention):**
- POST always returns `id: 11`, so we create our own unique id with `Date.now()`.
- PUT only works for ids 1–10, so editing a contact you added says "saved locally".

**`async / await`:** `fetch` takes time. `await` waits for the answer without freezing the page. `try/catch` handles errors (no internet, server error). `response.ok` is false for 4xx/5xx statuses, so we throw an error ourselves.

---

## 💾 localStorage keys

| Key | Saved by | What's in it |
|---|---|---|
| `session` | login.js | `{ email, loginTime }` — means "logged in" |
| `rememberedEmail` | login.js | Email, if "Remember my email" is ticked |
| `users` | dashboard / Vue / React | The contacts list (shared by all 3 versions!) |
| `lastSearch` | dashboard.js | Last search text, restored on reload |
| `contactMessages` | contact.js | Messages sent from the Contact Us form |

localStorage only stores **strings**, so:
```js
localStorage.setItem("users", JSON.stringify(users)); // save:  array -> string
const users = JSON.parse(localStorage.getItem("users")); // load: string -> array
```
**Show it live:** browser DevTools (F12) → **Application** tab → **Local Storage**.

---

## 🖱️ Events (every button / input)

| Element | Event | What happens | File |
|---|---|---|---|
| Login form | `submit` | `preventDefault()` → validate → save session → redirect | login.js |
| Email / password inputs | `input` | Live validation while typing | login.js |
| Show/Hide | `click` | Switches input `type` between `password` and `text` | login.js |
| Logout | `click` | `confirm()` → remove session → login page | auth.js |
| Add/Edit form | `submit` | Validate → POST or PUT → save → redraw | dashboard.js |
| Cancel edit | `click` | Clears the form back to "Add" mode | dashboard.js |
| Edit / Delete (table) | `click` | **Event delegation** (see below) | dashboard.js |
| Search box | `input` | Filters the table on every keystroke | dashboard.js |
| "Name" header | `click` | Toggles A→Z / Z→A sort | dashboard.js |
| Reload from API | `click` | Ignores localStorage, does a fresh GET | dashboard.js |
| Message textarea | `input` | Character counter | contact.js |
| Contact form | `submit` / `reset` | Validate & save / clear errors | contact.js |
| Delete message / Clear all | `click` | Remove from localStorage, redraw list | contact.js |

**Event delegation** (good thing to explain): instead of adding a listener to every Edit/Delete button, we add **one** listener to the `<tbody>`. A click on a button "bubbles up" to the tbody. We find which button was clicked with `event.target.closest("button")`, and read `data-action` and `data-id` from it. This works even for rows created later.

**`event.preventDefault()`**: a form normally reloads the page when submitted. This stops that so our JavaScript can handle it.

---

## ✔️ Validation rules

| Form | Field | Rule |
|---|---|---|
| Login | Email | Required, must match `name@domain.com` pattern |
| Login | Password | Required, at least 6 chars, at least 1 number, must match demo password |
| Add contact | Name | At least 3 characters |
| Add contact | Email | Valid email pattern |
| Add contact | Phone | At least 10 digits (spaces/dashes allowed) |
| Add contact | City | Required |
| Contact Us | Name | Required, no numbers |
| Contact Us | Subject | Must choose one |
| Contact Us | Message | At least 10 characters, max 300 |

The email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` means: some characters (no spaces or @) + `@` + some characters + `.` + some characters.

`novalidate` on the `<form>` turns off the browser's own popups so our JS messages show instead.

---

## ⚖️ Framework comparison (plain JS vs Vue vs React)

All three show the same contacts table with search and delete, and share the same `users` data in localStorage (delete in Vue → it's gone in React too).

| | Plain JavaScript | Vue 3 | React 18 |
|---|---|---|---|
| Updating the screen | **We** clear the table and rebuild rows by hand (`renderTable()`) | Automatic when `data` changes | Automatic when you call a `setState` function |
| State | Normal variables (`let users`) | `data()` | `useState()` |
| Search box | `addEventListener("input")` + call `renderTable()` | `v-model="search"` (two-way binding) | `value={search}` + `onChange` |
| Loop over rows | `forEach` + `insertRow()` | `v-for` | `.map()` in JSX |
| Click | `addEventListener("click")` | `@click` | `onClick` |
| Run on page load | Call `loadUsers()` at the bottom | `mounted()` | `useEffect(..., [])` |
| Lines for the table part | Most | Fewest | Middle |

**What I learned:** plain JS gives full control but you must update the screen yourself. Vue and React are "reactive" — you change the data and the screen updates itself. Vue feels closer to HTML (templates); React puts HTML inside JavaScript (JSX). Both were loaded from a CDN, so no `npm` or build step was needed.

---

## 🎨 Styling (`css/style.css`)

- **CSS variables** (`--primary`, `--danger`…) in `:root` — change the theme colour in one place.
- **Flexbox** for the navbar and toolbar, **CSS Grid** (`auto-fit, minmax`) for the form so it wraps on small screens.
- `.invalid` class (red border) added/removed by JavaScript during validation.
- Hover, focus ring and a small "press" effect on buttons (`transform: scale`).
- Table scrolls sideways on phones (`.table-wrap { overflow-x: auto }`).

---

## 🔒 Things to admit honestly (shows understanding)

- Checking the password in the browser is **only for a demo** — anyone can read the JS. Real apps check on the server and return a token.
- localStorage is **not secure** for real passwords/tokens and is per-browser only.
- Rows are built with `textContent` (not `innerHTML`) so text typed into the form can't run as HTML/script (prevents XSS).

---

## ❓ Questions you might be asked

**Why `JSON.stringify` / `JSON.parse`?** localStorage only stores strings.

**localStorage vs sessionStorage?** localStorage stays after closing the browser; sessionStorage is cleared when the tab closes.

**What does `async/await` do?** Lets us write code that waits for the network without blocking the page; it's a cleaner way of writing `.then()`.

**What if the API is down?** `try/catch` catches the error and we fall back to the mock API, and the status line says so.

**Why one click listener on the table?** Event delegation: fewer listeners, and it works for rows added later.

**How do you protect the dashboard?** `requireLogin()` checks for `session` in localStorage at the top of every page and redirects to login if it's missing.

**PUT vs PATCH?** PUT replaces the whole object, PATCH updates only the fields you send.

**What's a status code?** The server's reply number: 200 OK, 201 Created, 404 Not Found, 500 Server Error. `response.ok` is true for 200–299.

**Why `data-id` on buttons?** So the click handler knows which contact the button belongs to.

---

## 🧪 Demo script (2–3 minutes)

1. Click Login with empty fields → errors. Type a bad email → live error. Wrong password → message.
2. Log in → dashboard loads with `GET ✔`.
3. Open DevTools → Application → Local Storage → show `session` and `users`. Network tab → show the GET request.
4. Add a contact with bad data → errors; then valid → `POST ✔`.
5. Search for it → Edit → `PUT ✔` → Delete → `DELETE ✔`.
6. Click "Name" to sort. Refresh the page → data and search are still there (localStorage).
7. Contact Us → send a message → it's listed and survives refresh.
8. Open Vue and React versions → same data, explain the comparison table.
9. Logout → try opening `dashboard.html` directly → redirected to login.
