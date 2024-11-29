import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import GameBoard from '../components/GameBoard';

function GamePage() {
    const { roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState(null);
    const [playerName] = useState(() => localStorage.getItem('playerName') || 'Player');
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        if (!socket) return;

        // Join the game room
        socket.emit('joinGame', { roomId, playerName });

        // Listen for game state updates
        socket.on('gameState', (state) => {
            console.log('Received gameState:', state);
            setGameState(state);
            if (state.players.length === 1 && status !== 'playing') {
                setStatus('waiting');
            }
        });

        // Game starts when second player joins
        socket.on('gameStart', (state) => {
            console.log('Received gameStart:', state);
            setGameState(state);
            setStatus('playing');
        });

        socket.on('roomFull', () => {
            alert('Room is full!');
            navigate('/');
        });

        socket.on('roomNotFound', () => {
            alert('Room not found!');
            navigate('/');
        });

        socket.on('playerDisconnected', () => {
            setStatus('waiting');
        });

        // Add these event listeners for game end conditions
        socket.on('gameWin', ({ winner }) => {
            console.log('Game won by:', winner);
            setGameState(prev => ({ ...prev })); // Ensure final state is shown
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        winner,
                        gameState: gameState,
                        isWinner: winner.id === socket.id
                    }
                });
            }, 500); // Short delay to show final move
        });

        socket.on('gameDraw', () => {
            console.log('Game ended in draw');
            setGameState(prev => ({ ...prev })); // Ensure final state is shown
            setTimeout(() => {
                navigate('/result', {
                    state: {
                        isDraw: true,
                        gameState: gameState
                    }
                });
            }, 500);
        });

        return () => {
            socket.off('gameState');
            socket.off('gameStart');
            socket.off('roomFull');
            socket.off('roomNotFound');
            socket.off('playerDisconnected');
            socket.off('gameWin');
            socket.off('gameDraw');
        };
    }, [socket, roomId, playerName, navigate, gameState]);

    const handleMakeMove = (columnIndex) => {
        if (socket && gameState) {
            const currentPlayer = gameState.players[gameState.currentTurn];
            if (currentPlayer.id === socket.id) {
                console.log('Making move:', columnIndex);
                socket.emit('makeMove', { roomId, columnIndex });
            } else {
                console.log('Not your turn!');
            }
        }
    };

    const renderStatus = () => {
        switch (status) {
            case 'connecting':
                return (
                    <div className="status-message">
                        <h3>Connecting to game...</h3>
                    </div>
                );
            case 'waiting':
                return (
                    <div className="waiting-room">
                        <h3>Waiting for opponent</h3>
                        <p>Share this room code with your friend:</p>
                        <div className="room-code">
                            <strong>{roomId}</strong>
                        </div>
                        <p>Players in room: {gameState?.players.length || 1}/2</p>
                    </div>
                );
            case 'playing':
                return (
                    <div className="game-info">
                        <div className="players-info">
                            {gameState?.players.map((player, index) => (
                                <div key={index} className={`player ${gameState.currentTurn === index ? 'active' : ''}`}>
                                    <span className={`player-color ${player.color}`}></span>
                                    <span>{player.name}</span>
                                    {gameState.currentTurn === index &&
                                        player.id === socket.id &&
                                        <span> (Your turn)</span>}
                                </div>
                            ))}
                        </div>
                        <GameBoard
                            gameState={gameState.gameState}
                            currentPlayer={gameState.players[gameState.currentTurn]}
                            onMakeMove={handleMakeMove}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <img
                    src="/icon.png"
                    alt="Connect Four"
                    className="game-icon"
                />
                <h2>Connect Four</h2>
            </div>
            {renderStatus()}
        </div>
    );
}

export default GamePage;