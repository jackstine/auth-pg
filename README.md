# Auth-PG

## Installation

```bash
npm install --save @nodeauth/auth-pg pg
```

## Setup

```javascript
const authPG = require("@nodeauth/auth-pg");
const pg = require("pg");
const client = new pg.Client(pgConfig);
authPG.create({ pgClient: client });
client.connect();
```

## Exposes

`authPG` in `const authPG = require('@nodeauth/auth-pg')` exposes two objects that give you a lot of power when it comes to authentication and users. `authPG.auth.users` and `authPG.auth.token`.

## authPG.auth.users

- createUserVerificationAndPassword - (email, password) can include all other user info as well. (phone, email, username, first_name, ...)
  - returns {verification, user, token}, does not return password
- verifyUser - (verification_code)
  - returns an {Object} -> {email, verified}
- forgotPassword - (email)
  - return an {Object} -> {email, password, expiresIn}
- resetPasswordFromTemporaryPassword - (email, tempPassword, newPassword)
  - returns {boolen} true or false
- getUser - (email)
  - returns the full user object
- updateUser - (email) and anything else, except for password
  - returns all data sent as parameter

## authPG.auth.token

- generateToken
- authenticateToken
- login
