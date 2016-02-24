/*
  File:        mySecrets.sql
  Description: My database for use with my remote Azure secrets app
  Created:     February 23rd 2016
  Version:     1.0 
*/
SET lc_messages = 'en_US';

SELECT '<starting mySecrets script>' AS '';
SET sql_mode = "STRICT_ALL_TABLES";

SELECT '<creating mySecrets database>' AS '';

DROP DATABASE IF EXISTS mySecrets;

CREATE DATABASE mySecrets;
USE mySecrets;

SELECT '<Creating Table User>' AS '';
CREATE TABLE User(
	userId INT(11) AUTO_INCREMENT,
    username VARCHAR(45) NOT NULL,
	userPassword VARCHAR(45) NOT NULL,
	userJoinedTimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT userUsername_unique UNIQUE(username),
	CONSTRAINT user_pk PRIMARY KEY(userId)
);

SELECT '<Creating Table Secret>' AS '';
CREATE TABLE Secret(
	secretId INT NOT NULL,
    secretTitle VARCHAR(45) NOT NULL,
    secretDescription VARCHAR(500),
    secretUserId INT(11),
    secretTimePosted TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT secret_userId FOREIGN KEY(secretUserId) REFERENCES User(userId),
    CONSTRAINT secret_pk PRIMARY KEY(secretId)
);

INSERT INTO User(username, userPassword) VALUES("usernameA", "testing");
INSERT INTO User(username, userPassword) VALUES("usernameB", "testing");
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(123, "C - My First Secret", "This is usernameA's first SQL secret", 1);
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(456, "A - My First Secret", "This is usernameA's second SQL secret", 1);
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(789, "B - My First Secret", "This is usernameA's third SQL secret", 1);
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(1011, "Y - My Second Secret", "This is usernameB's first SQL secret", 2);
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(1213, "Z - My Second Secret", "This is usernameB's Second SQL secret", 2);
INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(1415, "X - My Second Secret", "This is usernameB's third SQL secret", 2);

INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(1456275503, "testing", "text", 1);
SELECT '<Finished mySecrets script>' AS '';