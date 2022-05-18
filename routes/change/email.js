'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//| Change Email
//| 01 take the current email, new email and password
//| 02 confirm the password is correct
//| 03 set new email and send confirmation token

module.exports =  async function (fastify, opts) {
    fastify.post('/email', async (req, res) => {
        let { email, newEmail, password } = res.request.body;

        if (!password || !utils.validateEmail(email) || !utils.validateEmail(newEmail)) {
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

        // set new email and await validation
        user_doc.unverifiedEmail = {
            email: newEmail,
            token: crypto.randomBytes(6).toString("hex")
        }
        // console.log(user_doc);
        
        x = await u.setUser(user_doc);
        console.log(await x.body.json());

        res.send({ ok: true });
    });
}




