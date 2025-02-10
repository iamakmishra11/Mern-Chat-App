import socket from 'socket.io-client';


let socketInstance = null;


export const initializeSocket = (projectId) => {

    const socketInstance = socket('https://mern-chat-ai-app.onrender.com', {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    return socketInstance;

}

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}
