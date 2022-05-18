'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const Buffer  = require("buffer");
const { Auth, utils } = require("../../xauth/auth.js");

//| Delete Account request
//| 01 take the email and password
//| 02 confirm the password is correct
//| 03 set delete confirmation token and send email with token

module.exports =  async function (fastify, opts) {
    fastify.post('/delete/account', async (req, res) => {
        let { email, password } = res.request.body;

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

        user_doc.accountDeletionToken = crypto.randomByes(16).toString("hex");

        // email this token
        let token = Buffer.from(user_doc.email + "::" + user_doc.accountDeletionToken).toString("base64");

        x = await u.setUser(user_doc);

        res.send("done");
    });
}




