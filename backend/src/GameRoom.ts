import {v4 as uuid} from 'uuid';

export type Room = {
    roomId: string;
    isPrivate: boolean;
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
    createRoom(player1: string, isPrivate = false, privateRoomId: string): Room {
        const newRoom: Room = {
            roomId: `room-id-${!isPrivate ? uuid(): privateRoomId}`,
            players: { player1 },
            isPrivate
        };

        this.rooms.push(newRoom);
        return newRoom;
    }

    // Get an empty room where Player 2 can join
    getAnEmptyRoom(): Room | undefined {
        return this.rooms.find((room) => Object.keys(room.players).length === 1 && !room.isPrivate);
    }

    // Add Player 2 to an empty room
    addToRoom(player2: string, isPrivate = false, privateRoomId: string): Room {

        if(isPrivate){
            const privateRoom = this.getRoomById(privateRoomId);
            console.log('private room got from addToRoom: ', privateRoom);
            if(privateRoom){
                privateRoom.players.player2 = player2;
            }else{
                const privateRoom = this.createRoom(player2, true, privateRoomId);
                return privateRoom;
            }
            return privateRoom ;
        }
        const emptyRoom = this.getAnEmptyRoom();
        if (!emptyRoom) {
            const room = this.createRoom(player2, false, '');
            return room
        }

        emptyRoom.players.player2 = player2;

        return emptyRoom;
    }

    getRoom(player: string){
        return this.rooms.find(room => room.players.player1 === player || room.players.player2 === player);
    }
    getRoomById(roomID: string){
        const room = this.rooms.find(room => room.roomId === `room-id-${roomID}` );
        if(!room) {
            return null;
        }
        return room;
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
