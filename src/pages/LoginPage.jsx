import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (username.trim()) {
            localStorage.setItem('playerName', username);
            // Create new room
            try {
                const response = await fetch('http://localhost:3001/api/create-game', {
                    method: 'POST'
                });
                const data = await response.json();
                navigate(`/game/${data.roomId}`);
            } catch (error) {
                console.error('Error creating game:', error);
                alert('Error creating game');
            }
        }
    };

    const handleJoinGame = (e) => {
        e.preventDefault();
        if (username.trim() && roomId.trim()) {
            localStorage.setItem('playerName', username);
            navigate(`/game/${roomId}`);
        }
    };

    return (
        <div className="login-container">
            <h1>Connect Four</h1>
            <div className="login-options">
                {!isJoining ? (
                    <div className="create-game">
                        <h2>Create New Game</h2>
                        <form onSubmit={handleCreateGame}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                            <button type="submit">Create Game</button>
                        </form>
                        <button
                            className="switch-button"
                            onClick={() => setIsJoining(true)}
                        >
                            Join Existing Game
                        </button>
                    </div>
                ) : (
                    <div className="join-game">
                        <h2>Join Game</h2>
                        <form onSubmit={handleJoinGame}>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Enter room code"
                                required
                            />
                            <button type="submit">Join Game</button>
                        </form>
                        <button
                            className="switch-button"
                            onClick={() => setIsJoining(false)}
                        >
                            Create New Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginPage; 