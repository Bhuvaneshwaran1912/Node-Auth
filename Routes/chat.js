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
server.listen(process.env.SCOCKET_PORT_CHAT, () => {
    console.log('WebSocket server is running on', process.env.SCOCKET_PORT_CHAT);
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Received message:', msg);

        const query = `INSERT INTO messages (SENDER_ID, RECIPIENT_ID, USR_MSG, USR_CONVID,IS_READ, USR_MSG_TYPE) 
                       VALUES (?, ?, ?, ?, ?, ?)`;

        const { SENDER_ID, RECIPIENT_ID, USR_MSG, USR_CONVID, IS_READ, USR_MSG_TYPE } = msg;

        connection.query(query, [SENDER_ID, RECIPIENT_ID, USR_MSG, USR_CONVID, IS_READ, USR_MSG_TYPE], (err, results) => {
            if (err) {
                console.error('Error inserting message:', err);
                return;
            }
            console.log('Message inserted into database:', results);
        });

        var socketQuery =
            `SELECT 
    m.MSG_ID,
    m.SENDER_ID,
    sender.USR_NAME AS SENDER_NAME,
    m.RECIPIENT_ID,
    recipient.USR_NAME AS RECIPIENT_NAME,
    m.USR_MSG,
    m.CREATED_DATE,
    m.USR_CONVID,
    m.IS_READ,
    m.USR_MSG_TYPE
FROM 
    messages m
LEFT JOIN 
    UserManagement sender ON m.SENDER_ID = sender.ID
LEFT JOIN 
    UserManagement recipient ON m.RECIPIENT_ID = recipient.ID
WHERE 
    m.SENDER_ID = ${SENDER_ID} AND m.RECIPIENT_ID = ${RECIPIENT_ID} 
ORDER BY 
    m.CREATED_DATE DESC;`;
        connection.query(socketQuery, [SENDER_ID, RECIPIENT_ID], (err, results) => {
            if (!err) {
                if (results.length > 0) {

                    var isReadQuery = `                         
                        SELECT 
                UM.ID ,
                UM.USR_NAME ,
                UM.USR_EMAIL ,
                COALESCE(MAX(M.IS_READ), 0) AS IS_READ, -- Use 0 if no matching message
                MAX(M.CREATED_DATE) AS LastMessageDate, -- NULL if no message exists
                CASE 
                    WHEN M.RECIPIENT_ID IS NOT NULL THEN 1 -- Matchable
                    ELSE 0 -- Unmatchable
                END AS Matchable,
                US.USR_ONLINE , -- Online/Offline status
                US.USR_LAST_SEEN  -- Time of last activity
            FROM 
                UserManagement UM
            LEFT JOIN 
                messages M ON UM.ID = M.SENDER_ID AND M.RECIPIENT_ID = ? -- Replace 1 with your input recipient ID
            LEFT JOIN 
                userStatus US ON UM.ID = US.USR_ID -- Join with userStatus table
            GROUP BY 
                UM.ID, UM.USR_NAME, UM.USR_EMAIL, US.USR_ONLINE, US.USR_LAST_SEEN
            ORDER BY 
                Matchable DESC, -- Matchable users first
                LastMessageDate DESC; -- Most recent messages within each group`

                    connection.query(isReadQuery, [RECIPIENT_ID], (errr, resultss) => {
                        if (!errr) {
                            var obj = {
                                msg: results[0],
                                isRead: resultss
                            }
                            io.emit('chat message', obj);
                        }
                    })
                }
            } else {
                console.log(err)
            }
        })
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// router.post('/chatHistory', (req, res) => {
//     var user = req.body
//     var query =
//         `SELECT 
//     m.MSG_ID,
//     m.SENDER_ID,
//     sender.USR_NAME AS SENDER_NAME,
//     m.RECIPIENT_ID,
//     recipient.USR_NAME AS RECIPIENT_NAME,
//     m.USR_MSG,
//     m.CREATED_DATE,
//     m.USR_CONVID,
//     m.IS_READ,
//     m.USR_MSG_TYPE
// FROM 
//     messages m
// LEFT JOIN 
//     UserManagement sender ON m.SENDER_ID = sender.ID
// LEFT JOIN 
//     UserManagement recipient ON m.RECIPIENT_ID = recipient.ID
// WHERE 
//     (m.SENDER_ID = ${user.SENDER_ID} AND m.RECIPIENT_ID = ${user.RECIPIENT_ID})
//     OR 
//     (m.SENDER_ID = ${user.RECIPIENT_ID} AND m.RECIPIENT_ID = ${user.SENDER_ID})
// ORDER BY 
//     m.CREATED_DATE ASC;`;
//     connection.query(query, [user.SENDER_ID, user.RECIPIENT_ID], (err, results) => {
//         if (!err) {
//             var obj = {
//                 data: results,
//             }
//             if (results.length > 0) {
//                 obj.code = 200; obj.message = 'Success';
//                 return res.status(200).json(obj)
//             }
//             else if (results.length == 0) {
//                 obj.code = 300; obj.message = 'No records Found!!'; obj.data = []
//                 return res.status(200).json(obj)
//             }
//         } else {
//             return res.status(500).json(err)
//         }
//     })
// })


router.post('/getUserChatStatus', (req, res) => {
    var user = req.body
    var query = `
            SELECT 
                UM.ID ,
                UM.USR_NAME ,
                UM.USR_EMAIL ,
                COALESCE(MAX(M.IS_READ), 0) AS IS_READ, -- Use 0 if no matching message
                MAX(M.CREATED_DATE) AS LastMessageDate, -- NULL if no message exists
                CASE 
                    WHEN M.RECIPIENT_ID IS NOT NULL THEN 1 -- Matchable
                    ELSE 0 -- Unmatchable
                END AS Matchable,
                US.USR_ONLINE , -- Online/Offline status
                US.USR_LAST_SEEN  -- Time of last activity
            FROM 
                UserManagement UM
            LEFT JOIN 
                messages M ON UM.ID = M.SENDER_ID AND M.RECIPIENT_ID = ? -- Replace 1 with your input recipient ID
            LEFT JOIN 
                userStatus US ON UM.ID = US.USR_ID -- Join with userStatus table
            GROUP BY 
                UM.ID, UM.USR_NAME, UM.USR_EMAIL, US.USR_ONLINE, US.USR_LAST_SEEN
            ORDER BY 
                Matchable DESC, -- Matchable users first
                LastMessageDate DESC; -- Most recent messages within each group`;
    connection.query(query, [user.RECIPIENT_ID], (err, results) => {
        if (!err) {
            var obj = {
                data: results,
            }
            if (results.length > 0) {
                obj.code = 200; obj.message = 'Success';
                return res.status(200).json(obj)
            }
            else if (results.length == 0) {
                obj.code = 300; obj.message = 'No records Found!!'; obj.data = []
                return res.status(200).json(obj)
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.post('/chatHistory', (req, res) => {
    const user = req.body;

    // Update IS_READ for unread messages
    const updateQuery = `
        UPDATE messages 
        SET IS_READ = 0 
        WHERE  RECIPIENT_ID = ? AND SENDER_ID = ? 
    `;

    // Execute the update query
    connection.query(updateQuery, [user.RECIPIENT_ID, user.SENDER_ID], (updateErr, updateResult) => {
        if (updateErr) {
            return res.status(500).json({ code: 500, message: 'Error updating read status', error: updateErr });
        }

        // Fetch chat history
        const selectQuery = `
            SELECT 
                m.MSG_ID,
                m.SENDER_ID,
                sender.USR_NAME AS SENDER_NAME,
                m.RECIPIENT_ID,
                recipient.USR_NAME AS RECIPIENT_NAME,
                m.USR_MSG,
                m.CREATED_DATE,
                m.USR_CONVID,
                m.IS_READ,
                m.USR_MSG_TYPE
            FROM 
                messages m
            LEFT JOIN 
                UserManagement sender ON m.SENDER_ID = sender.ID
            LEFT JOIN 
                UserManagement recipient ON m.RECIPIENT_ID = recipient.ID
            WHERE 
                (m.SENDER_ID = ? AND m.RECIPIENT_ID = ?)
                OR 
                (m.SENDER_ID = ? AND m.RECIPIENT_ID = ?)
            ORDER BY 
                m.CREATED_DATE ASC;
        `;

        // Execute the select query
        connection.query(selectQuery, [user.SENDER_ID, user.RECIPIENT_ID, user.RECIPIENT_ID, user.SENDER_ID], (selectErr, results) => {
            if (selectErr) {
                return res.status(500).json({ code: 500, message: 'Error fetching chat history', error: selectErr });
            }

            const response = {
                data: results,
                code: results.length > 0 ? 200 : 300,
                message: results.length > 0 ? 'Success' : 'No records Found!!'
            };

            return res.status(200).json(response);
        });
    });
});

module.exports = router;