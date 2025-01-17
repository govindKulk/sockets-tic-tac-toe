import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("Welcome to the Express + TypeScript server!");
});

// Export the app
export default app;
