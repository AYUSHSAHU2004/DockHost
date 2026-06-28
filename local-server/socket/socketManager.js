let io;

function initialize(socketServer) {
    io = socketServer;
}

function getIO() {
    return io;
}

module.exports = {
    initialize,
    getIO
};