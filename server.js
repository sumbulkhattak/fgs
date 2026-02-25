const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const ADMISSIONS_FILE = path.join(DATA_DIR, "admissions.json");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, "[]");
}
if (!fs.existsSync(ADMISSIONS_FILE)) {
  fs.writeFileSync(ADMISSIONS_FILE, "[]");
}

// Handle contact form submission
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required.");
  }

  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
  messages.push({
    id: Date.now(),
    name,
    email,
    message,
    date: new Date().toISOString()
  });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

  // Redirect back to the referring page
  const referer = req.get("Referer") || "/students.html";
  const redirectUrl = new URL(referer);
  redirectUrl.searchParams.set("success", "true");
  res.redirect(redirectUrl.pathname + redirectUrl.search);
});

// Handle admission form submission
app.post("/admission", (req, res) => {
  const { studentName, fatherName, dob, gender, classApply, phone } = req.body;

  if (!studentName || !fatherName || !dob || !gender || !classApply || !phone) {
    return res.status(400).send("Required fields are missing.");
  }

  const admissions = JSON.parse(fs.readFileSync(ADMISSIONS_FILE, "utf-8"));
  admissions.push({
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString()
  });
  fs.writeFileSync(ADMISSIONS_FILE, JSON.stringify(admissions, null, 2));

  res.redirect("/admissions.html?success=true");
});

// API endpoints
app.get("/api/messages", (req, res) => {
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
  res.json(messages);
});

app.get("/api/admissions", (req, res) => {
  const admissions = JSON.parse(fs.readFileSync(ADMISSIONS_FILE, "utf-8"));
  res.json(admissions);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
