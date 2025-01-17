import {v4 as uuid} from 'uuid';

type Room = {
    roomId: string;
    players: {
        player1: string;
        player2?: string;
    };
};

export class GameRoom {
    private static instance: GameRoom; // Singleton instance
    private rooms: Room[] = []; // Track all rooms

    private constructor() { } // Private constructor to prevent direct instantiation

    static getInstance(): GameRoom {
        if (!this.instance) {
            this.instance = new GameRoom();
        }
        return this.instance;
    }

    // Create a new room and add Player 1
    createRoom(player1: string): Room {
        const newRoom: Room = {
            roomId: `room-id-${uuid()}`,
            players: { player1 },
        };

        this.rooms.push(newRoom);
        return newRoom;
    }

    // Get an empty room where Player 2 can join
    getAnEmptyRoom(): Room | undefined {
        return this.rooms.find((room) => Object.keys(room.players).length === 1);
    }

    // Add Player 2 to an empty room
    addToRoom(player2: string): Room {
        const emptyRoom = this.getAnEmptyRoom();
        if (!emptyRoom) {
            const room = this.createRoom(player2);
            return room
        }

        emptyRoom.players.player2 = player2;

        return emptyRoom;
    }

    getRoom(player: string){
        return this.rooms.find(room => room.players.player1 === player || room.players.player2 === player);
    }

    deleteRoom(room: Room) {
        this.rooms = this.rooms.filter(existingRoom => existingRoom.roomId !== room.roomId);
    }
    setRoom(room: Room){
        this.rooms = this.rooms.filter(existingRoom => {
            if(existingRoom.roomId === room.roomId){
                return room;
            }else{
                return existingRoom;
            }
        })

        console.log(this.rooms)
    }

    // Get all rooms (optional, for debugging or tracking purposes)
    getRooms(): Room[] {
        return this.rooms;
    }
}
