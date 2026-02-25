const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const DATA_DIR = "/tmp";
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const ADMISSIONS_FILE = path.join(DATA_DIR, "admissions.json");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure data files exist
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, "[]");
}
if (!fs.existsSync(ADMISSIONS_FILE)) {
  fs.writeFileSync(ADMISSIONS_FILE, "[]");
}

// Handle contact form
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).send("All fields are required.");
  }
  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
  messages.push({ id: Date.now(), name, email, message, date: new Date().toISOString() });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  res.redirect("/students.html?success=true");
});

// Handle admission form
app.post("/api/admission", (req, res) => {
  const { studentName, fatherName, dob, gender, classApply, phone } = req.body;
  if (!studentName || !fatherName || !dob || !gender || !classApply || !phone) {
    return res.status(400).send("Required fields are missing.");
  }
  const admissions = JSON.parse(fs.readFileSync(ADMISSIONS_FILE, "utf-8"));
  admissions.push({ id: Date.now(), ...req.body, date: new Date().toISOString() });
  fs.writeFileSync(ADMISSIONS_FILE, JSON.stringify(admissions, null, 2));
  res.redirect("/admissions.html?success=true");
});

module.exports = app;
