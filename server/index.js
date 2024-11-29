const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Store game rooms and their states
const gameRooms = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join game room
    socket.on('joinGame', ({ roomId, playerName }) => {
        console.log(`Player ${playerName} attempting to join room ${roomId}`);

        // Get room
        let room = gameRooms.get(roomId);

        // Check if room exists
        if (!room) {
            console.log(`Room ${roomId} not found`);
            socket.emit('roomNotFound');
            return;
        }

        // Check if player is already in the room
        const existingPlayer = room.players.find(p => p.name === playerName);
        if (existingPlayer) {
            console.log(`Player ${playerName} is already in room ${roomId}`);
            existingPlayer.id = socket.id; // Update socket id
            socket.join(roomId);
            socket.roomId = roomId;
            io.to(roomId).emit('gameState', room);
            return;
        }

        // Check if room is full
        if (room.players.length >= 2) {
            console.log(`Room ${roomId} is full`);
            socket.emit('roomFull');
            return;
        }

        // Add new player to room
        const newPlayer = {
            id: socket.id,
            name: playerName,
            color: room.players.length === 0 ? 'red' : 'yellow'
        };
        room.players.push(newPlayer);

        // Join socket room
        socket.join(roomId);
        socket.roomId = roomId;

        console.log(`Player ${playerName} joined room ${roomId}. Players: ${room.players.length}`);

        // Emit updated game state to all players in room
        io.to(roomId).emit('gameState', room);

        // If second player joined, emit gameStart
        if (room.players.length === 2) {
            console.log(`Starting game in room ${roomId}`);
            io.to(roomId).emit('gameStart', room);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (socket.roomId) {
            const room = gameRooms.get(socket.roomId);
            if (room) {
                // Remove disconnected player
                room.players = room.players.filter(player => player.id !== socket.id);

                if (room.players.length === 0) {
                    // If no players left, delete the room
                    gameRooms.delete(socket.roomId);
                } else {
                    // Notify remaining players
                    io.to(socket.roomId).emit('playerDisconnected');
                }
            }
        }
    });

    // Handle player move
    socket.on('makeMove', ({ roomId, columnIndex }) => {
        console.log(`Move attempt in room ${roomId}, column ${columnIndex}`);

        const room = gameRooms.get(roomId);
        if (!room) {
            console.log('Room not found');
            return;
        }

        const currentPlayer = room.players[room.currentTurn];
        if (currentPlayer.id !== socket.id) {
            console.log('Not player\'s turn');
            return;
        }

        const rowIndex = findLowestEmptyRow(room.gameState, columnIndex);
        if (rowIndex === -1) {
            console.log('Column is full');
            return;
        }

        console.log(`Making move at row ${rowIndex}, column ${columnIndex}`);
        room.gameState[rowIndex][columnIndex] = currentPlayer.color;

        // Check for win
        if (checkWin(room.gameState, rowIndex, columnIndex, currentPlayer.color)) {
            console.log(`Player ${currentPlayer.name} wins!`);
            io.to(roomId).emit('gameState', room); // Send final state before win
            io.to(roomId).emit('gameWin', { winner: currentPlayer });
            return;
        }

        // Check for draw
        if (isDraw(room.gameState)) {
            console.log('Game is a draw');
            io.to(roomId).emit('gameState', room); // Send final state before draw
            io.to(roomId).emit('gameDraw');
            return;
        }

        // Switch turns
        room.currentTurn = (room.currentTurn + 1) % 2;
        console.log(`Turn switched to player ${room.players[room.currentTurn].name}`);

        // Emit updated game state
        io.to(roomId).emit('gameState', room);
    });
});

// REST API endpoints
app.post('/api/create-game', (req, res) => {
    const roomId = Math.random().toString(36).substring(7);
    gameRooms.set(roomId, {
        players: [],
        gameState: Array(6).fill().map(() => Array(7).fill(null)),
        currentTurn: 0
    });
    console.log(`Created new room: ${roomId}`);
    res.json({ roomId });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function findLowestEmptyRow(board, columnIndex) {
    for (let row = 5; row >= 0; row--) {
        if (!board[row][columnIndex]) {
            return row;
        }
    }
    return -1;
}

function checkWin(board, row, col, color) {
    // Check horizontal
    for (let c = 0; c <= 3; c++) {
        if (col >= c && col <= c + 3) {
            if (board[row][c] === color &&
                board[row][c + 1] === color &&
                board[row][c + 2] === color &&
                board[row][c + 3] === color) {
                return true;
            }
        }
    }

    // Check vertical
    if (row <= 2) {
        if (board[row][col] === color &&
            board[row + 1][col] === color &&
            board[row + 2][col] === color &&
            board[row + 3][col] === color) {
            return true;
        }
    }

    // Check diagonal (positive slope)
    for (let r = 3; r < 6; r++) {
        for (let c = 0; c <= 3; c++) {
            if (board[r][c] === color &&
                board[r - 1][c + 1] === color &&
                board[r - 2][c + 2] === color &&
                board[r - 3][c + 3] === color) {
                return true;
            }
        }
    }

    // Check diagonal (negative slope)
    for (let r = 0; r <= 2; r++) {
        for (let c = 0; c <= 3; c++) {
            if (board[r][c] === color &&
                board[r + 1][c + 1] === color &&
                board[r + 2][c + 2] === color &&
                board[r + 3][c + 3] === color) {
                return true;
            }
        }
    }

    return false;
}

function isDraw(board) {
    return board[0].every(cell => cell !== null);
} 