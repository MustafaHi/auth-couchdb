'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//| Change Password
//| 01 take the current email, password and newPassword
//| 02 confirm the password is correct
//| 03 clear sessions and set new password

module.exports =  async function (fastify, opts) {
    fastify.post('/password', async (req, res) => {
        let { email, password, newPassword } = res.request.body;
        // console.log(name);

        // validate email

        if (!password || !newPassword || !utils.validateEmail(email)) {
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
        
        // validate new password

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

        user_doc.access.local = await u.hashPassword(newPassword);
        
        x = await u.setUser(user_doc);

        res.send({ ok: true });
    });
}




