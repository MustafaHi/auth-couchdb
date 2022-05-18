'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//| Clear Sessions
//| 01 take the email, password
//| 02 confirm the password is correct
//| 03 clear sessions

module.exports =  async function (fastify, opts) {
    fastify.post('/delete/sessions', async (req, res) => {
        let { email, password } = res.request.body;

        if (!password || !utils.validateEmail(email)) {
            return res.code(400).send
                ({
                    error: "bad_request",
                    message: "give correct parameters"
                });
        }
        var u = new Auth;
        
        let x = await u.findUser(email);
        if(!x) {
            return res.code(404).send
                ({
                    error: "not_found",
                    message: "no such user with this email"
                });
        }
        
        // validate password
        x = await u.getUser(x.id);
        let user_doc = await x.body.json();
        
        password = await u.hashPassword(password, user_doc.access.local.salt);

        if (password.derived_key !== user_doc.access.local.derived_key) {
            return res.code(400).send
                ({
                    error: "bad_password",
                    message: "give correct password"
                });
        }

        // clear sessions
        x = await u.clearSessions(user_doc.sessions);
        user_doc.sessions = [];
        
        x = await u.setUser(user_doc);

        res.send({ ok: true });
    });
}




