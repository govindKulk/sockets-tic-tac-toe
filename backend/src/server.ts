import { Server } from "socket.io";
import { createServer } from "http"; // Import to create a shared server
import app from "./app"; // Your Express app
import { GameRoom } from "./GameRoom";

// Set up the port
const PORT = parseInt(process.env.PORT) || 3000;

// Create a shared HTTP server
const httpServer = createServer(app); // Pass the Express app

// Attach Socket.io to the same server
const io = new Server(httpServer, {
    cors: {
        origin: ["https://sockets-tic-tac-toe.vercel.app/", "http://localhost:5173/"],
        methods: ["GET", "POST"],
        credentials: true, // Ensure cookies are sent if needed
    },
});

console.log(`Server running on port ${PORT}`);

// Singleton instance of GameRoom
const gameRoom = GameRoom.getInstance();

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    function joinRoom() {
        const room = gameRoom.addToRoom(socket.id);
        console.log(`${socket.id} has joined ${room.roomId}`);

        // Join the socket to a room
        socket.join(room.roomId);

        // Emit join-game event
        io.to(room.roomId).emit("join-game", {
            roomId: room.roomId,
            player1: room.players.player1,
            player2: room.players.player2,
            gameState: [],
        });

        console.log("Rooms from joinRoom():", gameRoom.getRooms());
        return room;
    }

    let room = joinRoom();

    socket.on("move", (data) => {
        console.log(data);
        socket.to(room.roomId).emit("move", data);
    });

    socket.on("restart", () => {
        socket.to(room.roomId).emit("restart");
    });

    socket.on("rematch", () => {
        socket.leave(room.roomId);
        console.log("Rooms:", gameRoom.getRooms());
        room = joinRoom();
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        const room = gameRoom.getRoom(socket.id);

        if (room && Object.keys(room.players).length === 1) {
            socket.leave(room.roomId);
            gameRoom.deleteRoom(room);
            return;
        }

        if (room) {
            socket.leave(room.roomId);
            gameRoom.deleteRoom(room);
            io.to(room.roomId).emit("opponent-disconnected", {
                user: "player-1",
            });
        }

        console.log("Rooms from disconnect:", gameRoom.getRooms());
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
