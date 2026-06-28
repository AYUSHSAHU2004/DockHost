const jwt = require("jsonwebtoken");

function registerSocket(io) {

    io.on("connection", (socket) => {

        try {

            const token =
                socket.handshake.auth.token;

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            socket.userId = decoded._id;

            socket.join(decoded._id);

            console.log(
                "User Joined Room:",
                decoded._id
            );

        } catch (err) {

            socket.disconnect();

        }

        socket.on("disconnect", () => {

            console.log(
                "Disconnected:",
                socket.id
            );

        });

    });

}

module.exports = registerSocket;