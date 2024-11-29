import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <img
                src="/logo.png"
                alt="Connect Four"
                className="home-logo"
            />
            <h1>Connect Four</h1>
            <button
                className="start-button"
                onClick={() => navigate('/login')}
            >
                Start Game
            </button>
        </div>
    );
}

export default HomePage; 