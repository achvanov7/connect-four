import React from 'react';
import '../styles/GameBoard.css';

function GameBoard({ gameState, currentPlayer, onMakeMove }) {
    const handleColumnClick = (columnIndex) => {
        const isColumnFull = gameState.every(row => row[columnIndex] !== null);
        if (!isColumnFull) {
            console.log('Column clicked:', columnIndex);
            onMakeMove(columnIndex);
        }
    };

    return (
        <div className="game-board">
            {gameState.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, columnIndex) => (
                        <div
                            key={`${rowIndex}-${columnIndex}`}
                            className="cell-container"
                            onClick={() => handleColumnClick(columnIndex)}
                            style={{
                                cursor: gameState[0][columnIndex] === null ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <div className={`cell ${cell || ''}`} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default GameBoard; 