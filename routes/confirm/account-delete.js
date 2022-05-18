'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const Buffer  = require("buffer");
const { Auth, utils } = require("../../xauth/auth.js");

//| Confirm Account deletion
//| 01 read the email and token from url
//| 02 confirm that the token match the user token
//| 04 delete account

module.exports =  async function (fastify, opts) {
    fastify.post('/account-delete/:token', async (req, res) => {

        const u = new Auth;
        
        let token = Buffer.from(req.params.token).toString("utf8").split("::");

        let x = await u.findUser(token[0]);
        if(!x) {
            return res.code(404).send
                ({
                    error: "not_found",
                    message: "no such user with this email"
                });
        }

        x = await u.getUser(x.id);
        let user_doc = await x.body.json();

        if (user_doc.accountDeletionToken == token[1])
        {
            // clear sessions
            x = await u.clearSessions(user_doc.sessions);
            user_doc.sessions = [];
            
            x = await u.request("DELETE", process.env.USERS_DB + "/" + user_doc._id, {}, { rev: user_doc._rev });
        }

        u.setUser(user_doc);

        res.send({ ok: true });
    });
}




