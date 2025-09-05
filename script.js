 let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 1;
        let gameMode = 'pvp';
        let isGameOver = false;
        let winningCells = [];
        let theme = 'classic';
        let score = { wins: 0, losses: 0, ties: 0 };
        let moveCount = 0;

        const cells = document.querySelectorAll('.cell');
        const statusDisplay = document.getElementById('status');
        const scoreDisplay = document.getElementById('score');
        const resetBtn = document.getElementById('resetBtn');
        const homeBtn = document.getElementById('homeBtn');
        const startBtn = document.getElementById('startBtn');
        const homeSection = document.getElementById('home');
        const gameSection = document.getElementById('game');
        const boardDiv = document.getElementById('board');
        const confettiDiv = document.getElementById('confetti');
        const fireworksDiv = document.getElementById('fireworks');
        const trophyDiv = document.getElementById('trophy');

        const winningCombos = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];

        function initGame() {
            board.fill('');
            currentPlayer = 1;
            isGameOver = false;
            winningCells = [];
            moveCount = 0;
            statusDisplay.textContent = theme === 'classic' ? "Player 1's turn (X)" : `Player 1's turn (${getSymbol(1)})`;
            cells.forEach(cell => {
                cell.setAttribute('data-symbol', '');
                cell.classList.remove('player1', 'player2', theme, 'winning-cell');
                cell.style.transform = '';
                cell.disabled = false;
            });
            updateScore();
            hideEffects();
        }

        function handleClick(e) {
            if (isGameOver || e.target.classList.contains('player1') || e.target.classList.contains('player2')) return;
            const index = +e.target.dataset.index;
            if (board[index] !== '') return; // Extra check
            board[index] = currentPlayer;
            updateCell(e.target, currentPlayer);
            moveCount++;

            e.target.disabled = true;

            checkWinner();
            if (!isGameOver) {
                switchPlayer();
                if (gameMode === 'pvc' && currentPlayer === 2) {
                    setTimeout(computerMove, 800);
                }
            }
        }

        function updateCell(cell, player) {
            const symbol = getSymbol(player);
            cell.setAttribute('data-symbol', symbol);
            cell.classList.add(`player${player}`, theme);
        }

        function getSymbol(player) {
            if (theme === 'classic') return player === 1 ? 'X' : 'O';
            if (theme === 'animals') return player === 1 ? 'FOX' : 'WOLF';
            return player === 1 ? 'GRAPE' : 'MELON';
        }

        function switchPlayer() {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            statusDisplay.textContent = theme === 'classic' ? `Player ${currentPlayer === 1 ? '1' : '2'}'s turn (${currentPlayer === 1 ? 'X' : 'O'})` : `Player ${currentPlayer === 1 ? '1' : '2'}'s turn (${getSymbol(currentPlayer)})`;
        }

        function checkWinner() {
            for (let combo of winningCombos) {
                const [a, b, c] = combo;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    isGameOver = true;
                    winningCells = [a, b, c];
                    highlightWinningCells();
                    const winner = board[a];
                    statusDisplay.textContent = `Player ${winner === 1 ? '1' : '2'} (${getSymbol(winner)}) WINS!`;
                    if (gameMode === 'pvc') {
                        if (winner === 1) score.wins++;
                        else score.losses++;
                    } else {
                        // For PvP, increment wins for the winner
                        if (winner === 1) score.wins++;
                        else score.losses++;
                    }
                    triggerWinEffects();
                    updateScore();
                    return;
                }
            }
            if (board.every(cell => cell !== '')) {
                isGameOver = true;
                statusDisplay.textContent = 'Epic Draw!';
                score.ties++;
                updateScore();
            }
        }

        function highlightWinningCells() {
            winningCells.forEach(index => {
                const cell = document.querySelector(`[data-index="${index}"]`);
                cell.classList.add('winning-cell');
                cell.style.transform = 'scale(1.2)';
            });
            boardDiv.classList.add('shake');
        }

        function triggerWinEffects() {
            showConfetti();
            showFireworks();
            showTrophy();
            setTimeout(hideEffects, 5000);
        }

        function showConfetti() {
            const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#f39c12', '#e74c3c'];
            for (let i = 0; i < 200; i++) {
                const particle = document.createElement('div');
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 20 + '%';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.animationDelay = Math.random() * 4 + 's';
                confettiDiv.appendChild(particle);
            }
            confettiDiv.style.display = 'block';
        }

        function showFireworks() {
            const colors = ['red', 'blue', 'yellow', 'green', 'purple'];
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.animationDelay = Math.random() * 1 + 's';
                fireworksDiv.appendChild(particle);
            }
            fireworksDiv.style.display = 'block';
        }

        function showTrophy() {
            trophyDiv.style.display = 'block';
        }

        function hideEffects() {
            confettiDiv.style.display = 'none';
            fireworksDiv.style.display = 'none';
            trophyDiv.style.display = 'none';
            while (confettiDiv.firstChild) confettiDiv.removeChild(confettiDiv.firstChild);
            while (fireworksDiv.firstChild) fireworksDiv.removeChild(fireworksDiv.firstChild);
            boardDiv.classList.remove('shake');
        }

        function updateScore() {
            scoreDisplay.textContent = `Wins: ${score.wins} | Losses: ${score.losses} | Ties: ${score.ties}`;
        }

        function computerMove() {
            let move = findBestMove();
            if (move !== -1) {
                board[move] = 2;
                const cell = document.querySelector(`[data-index="${move}"]`);
                updateCell(cell, 2);
                cell.disabled = true;
                moveCount++;
                checkWinner();
                if (!isGameOver) switchPlayer();
            }
        }

        function findBestMove() {
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 2;
                    if (isWinningMove()) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 1;
                    if (isWinningMove()) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }
            if (board[4] === '') return 4;
            const corners = [0,2,6,8];
            for (let corner of corners) {
                if (board[corner] === '') return corner;
            }
            const edges = [1,3,5,7];
            for (let edge of edges) {
                if (board[edge] === '') return edge;
            }
            return board.indexOf('');
        }

        function isWinningMove() {
            for (let combo of winningCombos) {
                const [a, b, c] = combo;
                if (board[a] === board[b] && board[a] === board[c]) return true;
            }
            return false;
        }

        // Event listeners
        cells.forEach(cell => cell.addEventListener('click', handleClick));
        resetBtn.addEventListener('click', initGame);
        homeBtn.addEventListener('click', () => {
            gameSection.style.display = 'none';
            homeSection.style.display = 'flex';
            document.body.classList.remove('theme-' + theme);
            hideEffects();
        });
        startBtn.addEventListener('click', () => {
            theme = document.querySelector('input[name="theme"]:checked').value;
            gameMode = document.querySelector('input[name="mode"]:checked').value;
            document.body.classList.add('theme-' + theme);
            homeSection.style.display = 'none';
            gameSection.style.display = 'flex';
            initGame();
        });

        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.body.classList.remove('theme-classic', 'theme-neon', 'theme-dark');
                document.body.classList.add('theme-' + radio.value);
            });
        });
