# SSP-04-002-Assignment-01

Assignment-01 for the Server Side Programming module, as part of the Creative Mulitimedia B.Sc (hons) degree course in Limerick Institute of Technology, Clonmel

- App created using express-generator
- Authenticating sessions using express-sessions in combination with a stored database of registered users
- Anyone that visits the app can create a new account, and log in to store and view their own secrets
- Persisting user login credentials, as well as their own secrets in local/remote MySQL Database
- All secrets, as well as sensitive log in data, such as passwords, are encrypted for security and privacy purposes
- Secrets can be sorted by their titles or by the time they were created
- Storing current sort preference of a user using cookie-parser
- This application is running live on Azure
- The MySQL database is also running live on Azure (I also have a local one running on the WAMP server for testing purposes)