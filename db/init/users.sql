CREATE TABLE IF NOT EXISTS users (
	username VARCHAR(64) NOT NULL,
	password VARCHAR(64) NOT NULL,
	email VARCHAR(64) NOT NULL,
	phone VARCHAR(64) NOT NULL,
	tin VARCHAR(64) NOT NULL,
	country VARCHAR(64) NOT NULL,
	address VARCHAR(64) NOT NULL,
	longitude INT,
	latitude INT,
	admin BOOL,
	name VARCHAR(64) NOT NULL,
	surname VARCHAR(64) NOT NULL,
	PRIMARY KEY (username)
);

INSERT INTO users VALUES (
'admin',
'admin',
'admin@mail.com',
'6969696969',
'165432100',
'Greece',
'Home',
0,
0,
1,
'Admin',
'Admin');
