# auth-couchdb

Node.js server authentication application for Couchdb NoSQL database

## Features

- Session based setup each login is given an access token `name:pass` which the user can use to access the database directly, this token can be later revoked, disallowing access for the specified application/device.
- Simplified and easily extendable setup can be used with other NoSQL databases
- Using the latest and fastest API's for Node.js including [fastify](https://github.com/fastify/fastify) web framework and [undici](https://github.com/nodejs/undici) HTTP client
- Using fastify's auto directory scan for auto page addition
- Account creation, activation, modification and deletion.


## Setup

Copy the source code to your Node.js project then install the packages used.

Modify `.env` and it declared options

```c
ADDRESS = "http://127.0.0.1:5984" //| address of database
USERS_DB = "x-users" //| database name to be used for sessions
COUCHDB_AUTH = "YWRtaW46YWRtaW4=" //| base64 encoded `name:password` of the admin
```

#### Register


```js
// POST /auth/register
{
    name,
    email,
    password
}
```

#### Login

```js
// POST /auth/login
{
    email,
    password
}
```

#### Session

will delete all active session for the user.
```js
// POST auth/delete/sessions
{
    name,
    password
}
```

#### Account

will generat delete token that can be emailed for confirmation
```js
// POST auth/delete/account
{
    name,
    password
}
```

More can be seen inside /routes directory.

