/* ===== contact.js =====
   Contact Us page:
   - validates the form (name, email, subject, message length)
   - live character counter
   - saves each message into localStorage and lists them below
   - delete one message / clear all
*/

setupNavbar();

const MESSAGES_KEY = "contactMessages";

const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("cName");
const emailInput = document.getElementById("cEmail");
const subjectInput = document.getElementById("cSubject");
const messageInput = document.getElementById("cMessage");
const charCount = document.getElementById("charCount");
const contactMessage = document.getElementById("contactMessage");
const messageList = document.getElementById("messageList");
const clearAllBtn = document.getElementById("clearAllBtn");

/* ---------- localStorage ---------- */
function getMessages() {
  return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
}
function setMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

/* ---------- Validation ---------- */
function setError(input, errorId, message) {
  input.classList.toggle("invalid", message !== "");
  document.getElementById(errorId).textContent = message;
  return message === ""; // true when there is no error
}

function validateContactForm() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  const nameOk = setError(nameInput, "cNameError",
    name === "" ? "Name is required" : /\d/.test(name) ? "Name cannot contain numbers" : "");
  const emailOk = setError(emailInput, "cEmailError",
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email");
  const subjectOk = setError(subjectInput, "cSubjectError",
    subjectInput.value === "" ? "Please choose a subject" : "");
  const messageOk = setError(messageInput, "cMessageError",
    message.length < 10 ? "Message must be at least 10 characters" : "");

  return nameOk && emailOk && subjectOk && messageOk;
}

/* ---------- Showing saved messages ---------- */
function renderMessages() {
  const messages = getMessages();
  messageList.innerHTML = "";

  if (messages.length === 0) {
    messageList.innerHTML = '<p class="status">No messages yet.</p>';
    clearAllBtn.hidden = true;
    return;
  }
  clearAllBtn.hidden = false;

  messages.forEach(function (m) {
    const item = document.createElement("div");
    item.className = "message-item";

    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = m.subject + " — " + m.name;
    const body = document.createElement("p");
    body.textContent = m.message;
    const meta = document.createElement("small");
    meta.textContent = m.email + " · " + m.date;
    text.append(title, body, meta);

    const del = document.createElement("button");
    del.className = "btn small danger";
    del.textContent = "Delete";
    // EVENT: click on this message's Delete button
    del.addEventListener("click", function () {
      setMessages(getMessages().filter((x) => x.id !== m.id));
      renderMessages();
    });

    item.append(text, del);
    messageList.appendChild(item);
  });
}

/* ---------- Events ---------- */

// EVENT "input": live character counter
messageInput.addEventListener("input", function () {
  charCount.textContent = messageInput.value.length;
});

// EVENT "submit": validate, then save to localStorage
contactForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!validateContactForm()) {
    contactMessage.className = "form-message error-msg";
    contactMessage.textContent = "Please fix the errors above";
    return;
  }

  const messages = getMessages();
  messages.unshift({ // unshift = add to the start, so newest is on top
    id: Date.now(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    subject: subjectInput.value,
    message: messageInput.value.trim(),
    date: new Date().toLocaleString(),
  });
  setMessages(messages);

  contactForm.reset();
  charCount.textContent = "0";
  contactMessage.className = "form-message success-msg";
  contactMessage.textContent = "Message sent! (saved in localStorage)";
  renderMessages();
});

// EVENT "reset": clear the counter and error messages too
contactForm.addEventListener("reset", function () {
  charCount.textContent = "0";
  contactMessage.textContent = "";
  document.querySelectorAll("#contactForm .error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll("#contactForm .invalid").forEach((el) => el.classList.remove("invalid"));
});

// EVENT "click": clear all saved messages
clearAllBtn.addEventListener("click", function () {
  if (confirm("Delete all saved messages?")) {
    localStorage.removeItem(MESSAGES_KEY);
    renderMessages();
  }
});

// Pre-fill the email with the logged-in user's email
emailInput.value = getSession().email;
renderMessages();
