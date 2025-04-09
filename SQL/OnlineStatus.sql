CREATE TABLE userStatus (
    USR_ID INT PRIMARY KEY,
    -- User ID
    USR_ONLINE BOOLEAN DEFAULT FALSE,
    -- Online/Offline status
    USR_LAST_SEEN TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Time of last activity
);

-- To get the user list based on Latest messgae with who is online 
SELECT
    u.ID,
    u.USR_NAME,
    u.USR_EMAIL,
    u.USR_PHNO,
    IFNULL(s.USR_ONLINE, FALSE) AS USR_ONLINE,
    IFNULL(s.USR_LAST_SEEN, 'Never') AS USR_LAST_SEEN,
    m.USR_MSG,
    m.CREATED_DATE
FROM
    UserManagement u
    LEFT JOIN userStatus s ON u.ID = s.USR_ID
    LEFT JOIN messages m ON u.ID = m.SENDER_ID
    OR u.ID = m.RECIPIENT_ID
WHERE
    m.CREATED_DATE = (
        SELECT
            MAX(CREATED_DATE)
        FROM
            messages
        WHERE
            SENDER_ID = u.ID
            OR RECIPIENT_ID = u.ID
    )
ORDER BY
    m.CREATED_DATE DESC;