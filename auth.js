/* ===== auth.js =====
   Small helper functions shared by every page that needs a logged-in user.
   The "session" is just an object saved in localStorage under the key "session".
*/

const SESSION_KEY = "session";

// Read the current session from localStorage (returns null if nobody is logged in)
function getSession() {
  const saved = localStorage.getItem(SESSION_KEY); // localStorage only stores strings
  return saved ? JSON.parse(saved) : null;         // turn the string back into an object
}

// Save a session object (called by login.js after a successful login)
function saveSession(email) {
  const session = { email: email, loginTime: new Date().toLocaleString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session)); // object -> string
}

// Protect a page: if nobody is logged in, send them back to the login page
// loginPath lets pages in sub-folders (frameworks/) point to ../index.html
function requireLogin(loginPath = "index.html") {
  const session = getSession();
  if (!session) {
    window.location.href = loginPath;
    return null;
  }
  return session;
}

// Log out: remove the session and go back to the login page
function logout(loginPath = "index.html") {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = loginPath;
}

// Fill in the navbar ("Logged in as ...") and wire up the Logout button.
// Every protected page has <span id="navUser"> and <button id="logoutBtn">.
function setupNavbar(loginPath = "index.html") {
  const session = requireLogin(loginPath);
  if (!session) return;

  document.getElementById("navUser").textContent = session.email;

  // EVENT: click on Logout
  document.getElementById("logoutBtn").addEventListener("click", function () {
    if (confirm("Are you sure you want to log out?")) {
      logout(loginPath);
    }
  });
}
