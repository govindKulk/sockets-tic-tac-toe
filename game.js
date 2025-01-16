class Game {
    rows = 3;
    columns = 3;
    player1 = 'X';
    player2 = 'O';
    activePlayer = this.player1;
    rowElements = [];
    gameState = 'idle';
    winner = null;

    board = document.getElementById('board');
    resultContainer = document.getElementById('result');
    resetBtn = document.getElementById('reset-btn');

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

    init() {
        // Reset game state
        this.board.innerHTML = '';
        this.resultContainer.textContent = '';
        this.resetBtn.style.display = 'none';

        this.winner = null;
        this.activePlayer = this.player1;
        this.gameState = 'playing';

        // Render the board
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
            this.gameState = 'complete';
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
        const cell = e.target;
        if (!cell.classList.contains('cell') || this.gameState === 'complete' || cell.textContent) {
            return;
        }

        cell.textContent = this.activePlayer;
        this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;

        this.checkGameStatus();

        if (this.gameState === 'complete') {
            this.resultContainer.textContent = `${this.winner} is the winner!`;
            this.resetBtn.style.display = 'block';
        }
    }

    restart() {
        this.init();
    }
}

const game = new Game();
