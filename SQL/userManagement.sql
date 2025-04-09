CREATE DATABASE Test

use Test

CREATE TABLE UserManagement (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    USR_NAME VARCHAR(100) UNIQUE NOT NULL,
    USR_EMAIL VARCHAR(100) UNIQUE NOT NULL,
    USR_PSWD VARCHAR(50) NOT NULL,
    USR_PHNO VARCHAR(15) NOT NULL, -- Adjusted to VARCHAR for better compatibility with phone numbers
    CREATED_DATE DATETIME DEFAULT CURRENT_TIMESTAMP
);

select * from  UserManagement;

INSERT INTO UserManagement (USR_NAME, USR_EMAIL, USR_PSWD, USR_PHNO)
VALUES 
('Bob Smith', 'bob.smith@example.com', 'securepass456', '9123456789');

INSERT INTO UserManagement (USR_NAME, USR_EMAIL, USR_PSWD, USR_PHNO)
VALUES 
('Charlie Brown', 'charlie.brown@example.com', 'mypassword789', '9988776655');

INSERT INTO UserManagement (USR_NAME, USR_EMAIL, USR_PSWD, USR_PHNO)
VALUES 
('Diana Prince', 'diana.prince@example.com', 'wonderwoman123', '9871234567');

INSERT INTO UserManagement (USR_NAME, USR_EMAIL, USR_PSWD, USR_PHNO)
VALUES 
('Evan Wright', 'evan.wright@example.com', 'topsecret321', '9753102468');