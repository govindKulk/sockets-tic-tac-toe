import {io} from 'socket.io-client'

class Game {

    rows = 3;
    columns = 3;
    player1 = 'X';
    player2 = 'O';
    move = null;
    rowElements = [];
    gameStatus = 'idle';
    winner = null;
    user = null
    isYourMove = false
    isOpponentJoined = false

    startGameBtn = document.getElementById('start-game');
    board = document.getElementById('board');
    resultContainer = document.getElementById('result');
    resetBtn = document.getElementById('reset-btn');
    moveContainer = document.getElementById('move');
    totalMoves = 0
    moveIndicator = document.getElementById('move-indicator');
    socket = null
    customRoomBtn = document.getElementById('custom-room-btn');
    isPrivate = false

    constructor(rows = 3, columns = 3, player1 = "X", player2 = "O",) {
        this.rows = rows;
        this.columns = columns;
        this.player1 = player1;
        this.player2 = player2;

        // Bind methods once
        this.handleClick = this.handleClick.bind(this);
        this.restart = this.restart.bind(this);
        this.totalMoves = 0

        this.startGameBtn.addEventListener('click', function(){
            console.log(this.init)
            this.init.bind(this)();
            this.startGameBtn.style.display = 'none';
        }.bind(this))

        this.customRoomBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('clicked')
            const id = crypto.randomUUID();    
            window.location.href = '/room/'  + id;
        
        })
    }
    
    connectToServer(isPrivate = false) {
        this.socket = io("https://sockets-tic-tac-toe.onrender.com", {
            withCredentials: true, // Must match server credentials
            transports: ["websocket"], // Ensure WebSocket transport is used
        });
        console.log(this.socket)
        
        if(this.socket && !isPrivate){
            if(!isPrivate){
                this.socket.emit('create-public-room');
            }else{
                this.socket.emit('create-private-room', this.privateRoomId)
            }
        }
        this.socket.on('join-game', (data) => {
            const {roomId, player1, player2} = data;
            this.user = (this.socket.id === player1 ? 'player-1' : 'player-2')

            this.init()

            this.isYourMove = false
            if (player1 && player2){
                this.isOpponentJoined = true;
                this.setMove();
                if(this.user === 'player-1'){
                    this.isYourMove = true;
                }
                this.renderMoveIndicator();
            }
            
            console.log(roomId)

        })
        
        this.socket.on('opponent-disconnected', (data) => {
            const {isPrivate} = data;
            this.moveContainer.textContent = "Opponent disconnected ! Waiting for a new oppenent."
            console.log("opponent no more")
            this.isOpponentJoined = false;
            if(!isPrivate){
                this.socket.emit('rematch')
            }else{
                this.init();
                this.isYourMove = false;
            }
        } )

        

        this.socket.on('move', (data) => {
            console.log(data)
            this.isYourMove = ! this.isYourMove;
            this.gameStatus = data.gameStatus;
            this.updateBoard(data.gameBoard);
            this.totalMoves += 1;
            this.renderWinner();
            this.renderMoveIndicator();
        })



        this.socket.on('restart', () => {
            this.init();
        })
    }

    init() {
        // Reset game state
        this.board.innerHTML = '';
        this.resultContainer.textContent = '';
        this.resetBtn.style.display = 'none';
        
        this.moveContainer.style.display = 'none';
        this.totalMoves = 0;
        this.winner = null;
        this.move = this.player1;
        this.gameStatus = 'playing';

        // Render the board
        if(!this.socket){
            this.connectToServer();
        }else{
        
            this.setMove();
            if(this.user === 'player-1'){
                this.isYourMove = true;
            }else{
                this.isYourMove = false;
            }
        }

        this.renderBoard();
    }

    renderBoard() {
        this.rowElements = Array.from({ length: this.rows }, (_, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            this.board.appendChild(rowElement);

            const cells = Array.from({ length: this.columns }, (_, colIndex) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = rowIndex;
                cellElement.dataset.col = colIndex;
                rowElement.appendChild(cellElement);
                return cellElement;
            });

            return cells;
        });


        this.board.addEventListener('click', this.handleClick);
        this.resetBtn.addEventListener('click', this.restart);
    }

    checkGameStatus() {
        if (this.checkRows() || this.checkColumns() || this.checkDiagonals()) {
            this.gameStatus = 'complete';
        }
    }

    checkRows() {
        for (const row of this.rowElements) {
            const firstCellValue = row[0].textContent;
            if (firstCellValue && row.every(cell => cell.textContent === firstCellValue)) {
                this.winner = firstCellValue;
                return true;
            }
        }
        return false;
    }

    checkColumns() {
        for (let col = 0; col < this.columns; col++) {
            const columnCells = this.rowElements.map(row => row[col]);
  
            const firstCellValue = columnCells[0].textContent;
            if (firstCellValue && columnCells.every(cell => cell.textContent === firstCellValue)) {
                this.winner = firstCellValue;
                return true;
            }
        }
        return false;
    }

    checkDiagonals() {
        // Right diagonal (0,0 -> n,n)
        const rightDiagonal = this.rowElements.map((row, i) => row[i]);
        const rightDiagonalValue = rightDiagonal[0].textContent;
        if (rightDiagonalValue && rightDiagonal.every(cell => cell.textContent === rightDiagonalValue)) {
            this.winner = rightDiagonalValue;
            return true;
        }

        // Left diagonal (0,n -> n,0)
        const leftDiagonal = this.rowElements.map((row, i) => row[this.columns - i - 1]);
        const leftDiagonalValue = leftDiagonal[0].textContent;
        if (leftDiagonalValue && leftDiagonal.every(cell => cell.textContent === leftDiagonalValue)) {
            this.winner = leftDiagonalValue;
            return true;
        }

        return false;
    }

    handleClick(e) {

        if(!this.isYourMove) return;
        const cell = e.target;
        if (!cell.classList.contains('cell') || this.gameStatus === 'complete' || cell.textContent) {
            this.renderWinner();
            return;
        }
        

        cell.textContent = this.move;

        this.checkGameStatus();
        this.totalMoves += 1
        console.log(this.totalMoves)
        this.renderWinner();

        let gameBoard = this.rowElements.map(row => row.map(cell => cell.textContent));
        this.socket.emit('move', {
            gameStatus: this.gameStatus,
            gameBoard
        } )
        this.isYourMove = ! this.isYourMove;
        this.renderMoveIndicator();
    }

    updateBoard(gameBoard) {
        this.rowElements = this.rowElements.map((row,i ) => {
            return row.map((cell, j) => {
                console.log("gameboard i j: ", gameBoard[i][j]);
                cell.textContent = gameBoard[i][j];
                return cell; 
            })
        });
        this.renderWinner();
        console.log(this.rowElements);

        
    }
    
    renderWinner() {
        if (this.totalMoves === this.rows * this.columns && !this.winner){
            this.resultContainer.textContent = "Draw! Restart to play again."
            this.resetBtn.style.display = 'flex'
            this.gameStatus == 'draw';
            return;
        }
        if (this.gameStatus === 'complete') {
            let winningText = this.user === 'player-1' 
                                ?  this.winner === "X" ? 'You are a winner' : 'You Lost' 
                                : this.winner === "O" ? 'You are winner' : 'You Lost';
            this.resultContainer.textContent = winningText;
            this.resetBtn.style.display = 'flex';
        }

    }

    setMove() {
            this.move = this.user === 'player-1' ? this.player1: this.player2;
            this.moveContainer.style.display = 'block'
            if (this.isOpponentJoined){
                this.moveContainer.textContent = 'You are: ' + this.move;
            }else{
                this.moveContainer.textContent = "Waiting for an opponent to join."
            }
    }
    restart() {
        this.init();
        this.socket.emit('restart');
    }

    renderMoveIndicator() {
        if(this.gameStatus == 'draw'){
            this.moveIndicator.textContent = '';
            return;
        }
        if(this.isYourMove){
            this.moveIndicator.textContent = "Your Move"
        }else{
            this.moveIndicator.textContent = "Opponent's Move"
        }
    }

    joinPrivateRoom(roomId) {
        this.startGameBtn.removeEventListener('click', () => {})
        this.startGameBtn.style.display = 'none'
        this.privateRoomId = roomId;

        if(!this.socket){
            this.connectToServer(true)
        }
        this.socket.emit('create-private-room', {
            privateRoomId: `${roomId}`
        })


    }



}

const game = new Game();

function router() {
    const path = window.location.pathname;
    
    if (path.startsWith('/room/')) {
        const roomId = path.split('/room/')[1];
        console.log(roomId)
        if (roomId) {
            game.isPrivate = true;
            game.joinPrivateRoom(roomId); // Function to join the room
        } else {
            console.error('Room ID not found in the URL.');
        }
    } 
}




    window.addEventListener('popstate', router); // Handle back/forward navigation
    window.addEventListener('load', router); // Handle initial load
