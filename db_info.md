# MySQL db with docker and console

## Setup a MySQL server using Docker on port 3306
docker run --name demo-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -d mysql:latest

## Execute MySQL server monitor
sudo docker exec -it demo-mysql mysql -uroot -p

## Instructions for first time run

## w3schools sql tutorial:
https://www.w3schools.com/sql/default.asp

### Create a new database
CREATE DATABASE db;

### Use newly-created database
USE db;

### Create a new table with one column
CREATE TABLE users (id INT);

### Insert a new entry in table
INSERT INTO users(id) VALUES(0);

### Delete an entry from table
DELETE FROM users WHERE id=0;

### View table
SELECT * FROM users;

### Delete an existing table;
DROP TABLE users;

### Create proper table
CREATE TABLE users( username VARCHAR(64) NOT NULL, password VARCHAR(64) NOT NULL, PRIMARY KEY ( username) );

### Insert password safely, encrypted using SHA256
INSERT INTO users VALUES ('admin', SHA2('pass',256));

https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server