/* ===== api.js =====
   All the talking to the server lives here, so the rest of the app never calls fetch() directly.

   We use the FREE PUBLIC fake API "JSONPlaceholder":
     https://jsonplaceholder.typicode.com/users
   It accepts GET, POST, PUT and DELETE and replies like a real server,
   but it does NOT really save anything — so we keep our own copy in localStorage.

   There is also a MOCK API (fake functions with a delay) that is used when:
     - USE_MOCK_API is set to true, OR
     - the real API cannot be reached (no internet).
*/

const API_URL = "https://jsonplaceholder.typicode.com/users";
const USE_MOCK_API = false; // change to true to work completely offline

/* ---------------- REAL API (uses fetch) ---------------- */

const realApi = {
  // GET -> read the list of users
  async getUsers() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("GET failed: " + response.status);
    return response.json();
  },

  // POST -> create a new user (data goes in the request body as JSON)
  async addUser(user) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error("POST failed: " + response.status);
    return response.json();
  },

  // PUT -> replace an existing user
  async updateUser(id, user) {
    const response = await fetch(API_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error("PUT failed: " + response.status);
    return response.json();
  },

  // DELETE -> remove a user
  async deleteUser(id) {
    const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
    if (!response.ok) throw new Error("DELETE failed: " + response.status);
    return true;
  },
};

/* ---------------- MOCK API (no internet needed) ----------------
   Same function names, but returns made-up data after a short delay,
   so it "feels" like a real network call. */

const mockUsers = [
  { id: 1, name: "Aarav Sharma", email: "aarav@example.com", phone: "98450 11111", address: { city: "Bengaluru" }, company: { name: "TechNova" } },
  { id: 2, name: "Diya Patel", email: "diya@example.com", phone: "98450 22222", address: { city: "Mumbai" }, company: { name: "CloudNine" } },
  { id: 3, name: "Rohan Iyer", email: "rohan@example.com", phone: "98450 33333", address: { city: "Chennai" }, company: { name: "DataWorks" } },
  { id: 4, name: "Sneha Reddy", email: "sneha@example.com", phone: "98450 44444", address: { city: "Hyderabad" }, company: { name: "PixelSoft" } },
  { id: 5, name: "Kabir Mehta", email: "kabir@example.com", phone: "98450 55555", address: { city: "Pune" }, company: { name: "ByteCraft" } },
];

// Helper that waits `ms` milliseconds and then resolves with `value`
function fakeDelay(value, ms = 500) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const mockApi = {
  getUsers: () => fakeDelay(structuredClone(mockUsers)),
  addUser: (user) => fakeDelay({ ...user, id: 11 }),
  updateUser: (id, user) => fakeDelay({ ...user, id }),
  deleteUser: () => fakeDelay(true),
};

/* ---------------- The object the app actually uses ---------------- */

const api = {
  // Remembers which API answered last, so the UI can show it
  source: USE_MOCK_API ? "Mock API" : "JSONPlaceholder",

  async getUsers() {
    if (USE_MOCK_API) return mockApi.getUsers();
    try {
      const users = await realApi.getUsers();
      this.source = "JSONPlaceholder";
      return users;
    } catch (error) {
      // No internet / server down -> fall back to mock data
      console.warn("Real API failed, using mock API instead:", error.message);
      this.source = "Mock API (offline fallback)";
      return mockApi.getUsers();
    }
  },

  addUser(user) {
    return this.source === "JSONPlaceholder" ? realApi.addUser(user) : mockApi.addUser(user);
  },
  updateUser(id, user) {
    return this.source === "JSONPlaceholder" ? realApi.updateUser(id, user) : mockApi.updateUser(id, user);
  },
  deleteUser(id) {
    return this.source === "JSONPlaceholder" ? realApi.deleteUser(id) : mockApi.deleteUser(id);
  },
};
