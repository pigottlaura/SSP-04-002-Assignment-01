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
	secretId VARCHAR(20) NOT NULL,
    secretTitle VARBINARY(100) NOT NULL,
    secretDescription VARBINARY(400),
    secretUserId INT(11) NOT NULL,
    secretTimePosted TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT secret_userId FOREIGN KEY(secretUserId) REFERENCES User(userId),
    CONSTRAINT secret_pk PRIMARY KEY(secretId)
);

INSERT INTO User(username, userPassword) VALUES("Laura", "password");
INSERT INTO User(username, userPassword) VALUES("username", "password");
INSERT INTO User(username, userPassword) VALUES("testing", "123");

SELECT '<Finished mySecrets script>' AS '';