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
    board = document.getElementById('board');
    resultContainer = document.getElementById('result');
    resetBtn = document.getElementById('reset-btn');
    moveContainer = document.getElementById('move');

    socket = null

    constructor(rows = 3, columns = 3, player1 = "X", player2 = "O") {
        this.rows = rows;
        this.columns = columns;
        this.player1 = player1;
        this.player2 = player2;

        // Bind methods once
        this.handleClick = this.handleClick.bind(this);
        this.restart = this.restart.bind(this);

        this.init();
    }
    
    connectToServer() {
        this.socket = io('http://localhost:3000');
        console.log(this.socket)

        this.socket.on('join-game', (data) => {
            const {roomId, user} = data;
            this.user = user;
            console.log(roomId)
        })
        
        this.socket.on('opponent-disconnected', () => {
            console.log("opponent no more")
        } )

        this.socket.on('start-game', (data) => {
            console.log(data)
            this.setMove();
            if(this.user === 'player-1'){
                this.isYourMove = true;
            }
        })

        this.socket.on('move', (data) => {
            console.log(data)
            this.isYourMove = ! this.isYourMove;
            this.gameStatus = data.gameStatus;
            this.updateBoard(data.gameBoard);
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
       
        this.renderWinner();

        let gameBoard = this.rowElements.map(row => row.map(cell => cell.textContent));
        this.socket.emit('move', {
            gameStatus: this.gameStatus,
            gameBoard
        } )
        this.isYourMove = ! this.isYourMove;
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
            this.moveContainer.textContent = 'You are: ' + this.move;
    }
    restart() {
        this.init();
        this.socket.emit('restart');
    }


}

const game = new Game();
