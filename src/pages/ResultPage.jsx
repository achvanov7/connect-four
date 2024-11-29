import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { winner, isDraw } = location.state || {};

    const handlePlayAgain = () => {
        navigate('/login');
    };

    const handleBackHome = () => {
        navigate('/');
    };

    return (
        <div className="result-container">
            <div className="result-header">
                <img
                    src="/icon.png"
                    alt="Connect Four"
                    className="result-icon"
                />
                <h1>Game Over!</h1>
            </div>

            {isDraw ? (
                <div className="result-message">
                    <h2>It's a Draw!</h2>
                    <p>Both players played excellently!</p>
                </div>
            ) : winner ? (
                <div className="result-message">
                    <h2>{winner.name} Wins!</h2>
                    <div className={`winner-token ${winner.color}`} />
                    <p>{location.state.isWinner ?
                        "Congratulations on your victory!" :
                        "Better luck next time!"}</p>
                </div>
            ) : (
                <div className="result-message">
                    <h2>Game Ended</h2>
                    <p>The game has ended unexpectedly.</p>
                </div>
            )}

            <div className="result-actions">
                <button onClick={handlePlayAgain} className="play-again-button">
                    Play Again
                </button>
                <button onClick={handleBackHome} className="home-button">
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default ResultPage; 