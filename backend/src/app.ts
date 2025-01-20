import express from "express";
import { GameRoom } from "./GameRoom";
import cors from 'cors'
const app = express();

// Middleware
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("Welcome to the Express + TypeScript server!");
});

const gameRoom = GameRoom.getInstance();

app.use(cors({
  origin: ["https://sockets-tic-tac-toe.vercel.app/", "http://localhost:5173/"],
  methods: ["GET", "POST"],
  credentials: true

}))

app.get('/rooms', (req,res) => {
  const rooms = gameRoom.getRooms();
  console.log('rooms')
  res.json({rooms});
})



// Export the app
export default app;
