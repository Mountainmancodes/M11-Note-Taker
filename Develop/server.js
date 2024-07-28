const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to serve static files from the "public" directory
app.use(express.static("public"));
// Middleware for parsing JSON data
app.use(express.json());
// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Utility to read notes from db.json
const readNotes = () => {
  const data = fs.readFileSync(path.join(__dirname, "db", "db.json"), "utf8");
  return JSON.parse(data);
};

// Utility to write notes to db.json
const writeNotes = (notes) => {
  fs.writeFileSync(
    path.join(__dirname, "db", "db.json"),
    JSON.stringify(notes, null, 2)
  );
};

// Route to serve notes.html file
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

// Route to serve index.html file for the root endpoint
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// GET request to retrieve all notes
app.get("/api/notes", (req, res) => {
  console.log(`${req.method} request received to fetch notes`);
  const notes = readNotes();
  res.status(200).json(notes);
});

// GET request to retrieve a single note by ID
app.get("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  const notes = readNotes();

  if (!id) {
    return res.status(400).send("Note ID is required!");
  }

  console.log(`${req.method} request received to fetch a single note`);

  const note = notes.find((note) => note.id === id);

  if (!note) {
    return res.status(404).json("Note not found!");
  }

  res.status(200).json(note);
});

// POST request to add a new note
app.post("/api/notes", (req, res) => {
  console.log(`${req.method} request received to add a note`);
  const notes = readNotes();

  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    notes.push(newNote);
    writeNotes(notes);

    return res.status(201).json({
      status: "success",
      data: newNote,
    });
  } else {
    return res
      .status(400)
      .json("Request body must contain both a title and text");
  }
});

// DELETE request to remove a note by ID
app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  let notes = readNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    return res.status(404).json("Note not found!");
  }

  notes.splice(noteIndex, 1);
  writeNotes(notes);

  return res.status(200).json({
    status: "success",
    message: "Note deleted successfully",
  });
});

// Route to serve index.html file for any other endpoint
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
