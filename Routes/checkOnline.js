const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const router = express.Router();
const app = express();
const server = http.createServer(app);
const connection = require('../connection');

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:4200", // Angular app origin
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Start the server
server.listen(process.env.SCOCKET_PORT_ONLINE_STATUS || process.env.DEFAULT_PORT, () => {
    console.log('WebSocket server is running on', process.env.SCOCKET_PORT_ONLINE_STATUS);
});


// Store connected users (for simplicity)
let connectedUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user connects, save their socket ID and set them as online
    socket.on('userOnline', (userId) => {
        console.log("userId", userId);

        connectedUsers[userId] = socket.id;

        // Update user's status to online in the database
        connection.query(
            'INSERT INTO userStatus (USR_ID, USR_ONLINE) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE USR_ONLINE = TRUE, USR_LAST_SEEN = CURRENT_TIMESTAMP',
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error updating user status:', err);
                } else {
                    console.log(`${userId} is now online`);

                    var queryy = `
                    SELECT 
                        u.ID AS ID,                         
                        IFNULL(s.USR_ONLINE, FALSE) AS USR_ONLINE,
                        IFNULL(s.USR_LAST_SEEN, 'Never') AS USR_LAST_SEEN
                    FROM 
                        UserManagement u
                    LEFT JOIN 
                        userStatus s ON u.ID = s.USR_ID;`
                    connection.query(queryy, (err, results) => {
                        if (!err) {
                            if (results.length > 0) {
                                io.emit('userOnline', results);
                            }
                        } else {
                            return res.status(500).json(err)
                        }
                    })
                }
            }
        );
    });

    // When a user disconnects, mark them as offline
    socket.on('disconnect', () => {
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                // Update user's status to offline in the database
                connection.query(
                    'UPDATE userStatus SET USR_ONLINE = FALSE, USR_LAST_SEEN = CURRENT_TIMESTAMP WHERE USR_ID = ?',
                    [userId],
                    (err, results) => {
                        if (err) {
                            console.error('Error updating user status on disconnect:', err);
                        } else {
                            console.log(`${userId} is now offline`);

                            var queryy = `
                            SELECT 
                                u.ID AS ID,
                                IFNULL(s.USR_ONLINE, FALSE) AS USR_ONLINE,
                                IFNULL(s.USR_LAST_SEEN, 'Never') AS USR_LAST_SEEN
                            FROM 
                                UserManagement u
                            LEFT JOIN 
                                userStatus s ON u.ID = s.USR_ID;`
                            connection.query(queryy, (err, results) => {
                                if (!err) {
                                    var obj = {
                                        data: results,
                                    }
                                    if (results.length > 0) {
                                        io.emit('userOnline', results);
                                    }
                                } else {
                                    return res.status(500).json(err)
                                }
                            })
                        }
                    }
                );
                // Remove user from connected users map
                delete connectedUsers[userId];
                break;
            }
        }
    });
});


module.exports = router;