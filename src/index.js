import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import './styles/ResultPage.css';
import './styles/GameBoard.css';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <SocketProvider>
            <App />
        </SocketProvider>
    </React.StrictMode>
); 