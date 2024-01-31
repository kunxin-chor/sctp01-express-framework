To start mysql, in the terminal, type in `mysql -u root`

# Create a new database user
In the MySQL CLI:
```
CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY 'bar';

-- the foo user is able to do EVERYTHING
grant all privileges on *.* to 'foo'@'%';


FLUSH PRIVILEGES;

```

```
GRANT ALL PRIVILEGES on sakila.* TO 'ahkow'@'localhost' WITH GRANT OPTION;
```
**Note:** Replace *sakila* with the name of the database you want the user to have access to
 
 ```
FLUSH PRIVILEGES;
```
