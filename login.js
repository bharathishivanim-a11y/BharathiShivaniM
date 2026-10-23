/* ===== login.js =====
   Handles the login page:
   1. Form validation (email format, password rules)
   2. Show / hide password button
   3. "Remember my email" using localStorage
   4. Saving the session in localStorage and redirecting to the dashboard
*/

// Demo credentials (in a real app the SERVER checks these, never the browser)
const VALID_EMAIL = "admin@test.com";
const VALID_PASSWORD = "Admin@123";

// Grab the elements we need once, at the top
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePasswordBtn = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");
const formMessage = document.getElementById("formMessage");
const loginBtn = document.getElementById("loginBtn");

// If the user is already logged in, skip the login page
if (getSession()) {
  window.location.href = "dashboard.html";
}

// If they ticked "Remember my email" last time, pre-fill it
const rememberedEmail = localStorage.getItem("rememberedEmail");
if (rememberedEmail) {
  emailInput.value = rememberedEmail;
  rememberMe.checked = true;
}

/* ---------- Validation functions ----------
   Each one returns true/false and shows its own error message. */

function validateEmail() {
  const value = emailInput.value.trim();
  // Regex: something @ something . something (no spaces)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === "") {
    return showError(emailInput, emailError, "Email is required");
  }
  if (!emailPattern.test(value)) {
    return showError(emailInput, emailError, "Enter a valid email (e.g. name@mail.com)");
  }
  return clearError(emailInput, emailError);
}

function validatePassword() {
  const value = passwordInput.value;

  if (value === "") {
    return showError(passwordInput, passwordError, "Password is required");
  }
  if (value.length < 6) {
    return showError(passwordInput, passwordError, "Password must be at least 6 characters");
  }
  if (!/[0-9]/.test(value)) {
    return showError(passwordInput, passwordError, "Password must contain at least one number");
  }
  return clearError(passwordInput, passwordError);
}

// Helpers: add/remove the red border and message
function showError(input, errorEl, message) {
  input.classList.add("invalid");
  errorEl.textContent = message;
  return false;
}
function clearError(input, errorEl) {
  input.classList.remove("invalid");
  errorEl.textContent = "";
  return true;
}

/* ---------- Events ---------- */

// EVENT "input": fires on every keystroke -> live validation as the user types
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);

// EVENT "click": show / hide password
togglePasswordBtn.addEventListener("click", function () {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordBtn.textContent = isHidden ? "Hide" : "Show";
});

// EVENT "submit": fires when the Login button is clicked or Enter is pressed
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading (default form behaviour)
  formMessage.textContent = "";

  // Run BOTH validations (so both error messages show at once)
  const emailOk = validateEmail();
  const passwordOk = validatePassword();
  if (!emailOk || !passwordOk) return;

  // Check the credentials
  const email = emailInput.value.trim();
  if (email !== VALID_EMAIL || passwordInput.value !== VALID_PASSWORD) {
    formMessage.className = "form-message error-msg";
    formMessage.textContent = "Wrong email or password";
    return;
  }

  // Remember the email (or forget it) in localStorage
  if (rememberMe.checked) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }

  // Success: save session and go to the dashboard
  saveSession(email);
  formMessage.className = "form-message success-msg";
  formMessage.textContent = "Login successful! Redirecting...";
  loginBtn.disabled = true;

  setTimeout(function () {
    window.location.href = "dashboard.html";
  }, 800);
});
