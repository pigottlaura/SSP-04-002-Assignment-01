# SSP-04-002-Assignment-01

Assignment-01 for the Server Side Programming module, as part of the Creative Mulitimedia B.Sc (hons) degree course in Limerick Institute of Technology, Clonmel
**Note - In order to run this application locally, the appropriate environment variables would need to be set, and the mySecrets SQL script would need to be run to generate on a WAMP server (for example)**

- App structure
    - Created using express-generator
    - Some functionality (such as accordion menus etc) has been added using JQuery and JQuery UI, sourced through a CDN so as to reduce server load
- Anyone that visits the app can
    - Create a new account (using a unique username)
    - Login to their account
- Registered users can
    - Add new secrets
    - Edit existing secrets
    - Delete their secrets
    - Sort their secrets by title or the date they were created
- Sessions / Cookies
    - Authenticating sessions using express-sessions in combination with a stored database of registered users
    - Storing current sort preference of a user using cookie-parser
- Database
    - Persisting user login credentials, as well as their own secrets in a remote MySQL Database on Azure
    - Database was generated from an sql script
    - Managing my database through MySQLWorkbench
    - Running a local version of the database on a WAMP server (for testing purposes)
- Security
    - It is not possible to access the /users/secrets page unless the user is logged in
    - User passwords are encrypted in the database
    - All secret titles and descriptions are encrypted in the database
    - The encryption keys for the database are stored as environment variables on Azure (and locally for testing), so that they are not accessible publicly
- Azure
    - This web application is running live on Azure
    - The MySQL database is also running live on Azure
    - The web app and MySQL database are linked through a connection string (which is stored in the web application as an environment variable of the process
- Validation (In all of the below cases, the user will be notified of the issue through a warning on the relevant form)
    - Client Side
        - Data must be entered into both the user and password fields of the login form before a user can login
        - When creating a new account, the value of the password and confirm password fields much match before a user can submit a request to create an account
        - A username and password must be provided in order to create an account
    - Server Side
        - If a username is already taken, the request to create a new account will be cancelled
        - If a password does not match the username's password in the database, the user cannot login
        - If a username does not currently exist in the database, a user cannot log in with it