CREATE TABLE messages (
    MSG_ID INT PRIMARY KEY AUTO_INCREMENT,
    -- Unique identifier for each message
    SENDER_ID INT NOT NULL,
    RECIPIENT_ID INT DEFAULT NULL,
    USR_MSG TEXT NOT NULL,
    -- The message content
    CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Timestamp of the message
    USR_CONVID INT NOT NULL,
    -- ID to group messages into conversations
    IS_READ BOOLEAN DEFAULT FALSE,
    -- Indicates if the message has been read
    USR_MSG_TYPE VARCHAR(255),
    -- Type of the message
    FOREIGN KEY (SENDER_ID) REFERENCES UserManagement(ID) ON DELETE CASCADE,
    FOREIGN KEY (RECIPIENT_ID) REFERENCES UserManagement(ID) ON DELETE
    SET
        NULL
);

INSERT INTO
    messages (
        SENDER_ID,
        RECIPIENT_ID,
        USR_MSG,
        USR_CONVID,
        USR_MSG_TYPE
    )
VALUES
    (9, 1, 'Nothing !', 1, 'text'),
    (1, 9, 'Hello, Bhuvanesh!', 1, 'text'),
    (9, 1, 'Hi, Alice! How are you?', 1, 'text'),
    (1, NULL, 'Group message for everyone', 2, 'text'),
    (3, 2, 'Hello, Bob. This is Charlie.', 3, 'text'),
    (
        2,
        3,
        'Hey Charlie, nice to meet you.',
        3,
        'text'
    );

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
    LEFT JOIN UserManagement sender ON m.SENDER_ID = sender.ID
    LEFT JOIN UserManagement recipient ON m.RECIPIENT_ID = recipient.ID
WHERE
    (
        m.SENDER_ID = 1
        AND m.RECIPIENT_ID = 9
    )
    OR (
        m.SENDER_ID = 9
        AND m.RECIPIENT_ID = 1
    )
ORDER BY
    m.CREATED_DATE ASC;

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
    LEFT JOIN UserManagement sender ON m.SENDER_ID = sender.ID
    LEFT JOIN UserManagement recipient ON m.RECIPIENT_ID = recipient.ID
WHERE
    m.SENDER_ID = 1
    AND m.RECIPIENT_ID = 9
ORDER BY
    m.CREATED_DATE DESC;