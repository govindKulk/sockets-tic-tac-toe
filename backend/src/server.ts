import { Server } from "socket.io";
import { GameRoom } from "./GameRoom";

const io = new Server(3000, { cors: { origin: "*" } });

const gameRoom = GameRoom.getInstance(); // Singleton instance

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    const room = gameRoom.addToRoom(socket.id);
    console.log(`${socket.id} has joined ${room.roomId}`);

    // join the socket in a room
    socket.join(room.roomId)


    // 
    socket.emit("join-game", { 
        roomId: room.roomId,
        user: (!room.players.player2 ? 'player-1' : 'player-2') 
    });

    // if both players are joined then start the game
    if(room.players.player1 && room.players.player2){
        io.to(room.roomId).emit('start-game', {
            player1: room.players.player1,
            player2: room.players.player2,
            gameState: []
        })
    }

    // listen on move
    socket.on('move', (data) => {
        console.log(data);
        socket.to(room.roomId).emit('move', data)
    })
    
    // listen to restart the game
    socket.on('restart', () => {
        socket.to(room.roomId).emit('restart', )
    })
    





    // Handle disconnects
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Optional: Handle cleanup logic for disconnected players

        /*
        whenever a client disconnects from a room
        we have to broadcast event to other player in the room that client has been disconnected
        then remove that room from the rooms
        */
        let room = gameRoom.getRoom(socket.id);
        
        console.log('room', room);
        //  handle if room has only 1 element
        if (room && Object.keys(room.players).length == 1){
            socket.leave(room.roomId);
            gameRoom.deleteRoom(room);
            return;
        }


        let player1Id = room.players.player1 === socket.id ? room.players.player2 : room.players.player1;
        room.players = {player1: player1Id  }

        gameRoom.setRoom(room);

        socket.leave(room.roomId);
        socket.to(room.roomId).emit('opponent-disconnected', {
            user: 'player-1'
    
        });
    });

    return {
        socket,
        room
    }
});
