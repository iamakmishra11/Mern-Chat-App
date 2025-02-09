import socket from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
    socketInstance = socket('https://mern-chat-ai-app.onrender.com', { // Updated URL
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
};
