'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//| Confirm Email
//| 01 read token from url
//| 02 view containing the token and user id
//| 03 confirm that the token match the user token
//| 04 change email

module.exports =  async function (fastify, opts) {
    fastify.post('/email/:token', async (req, res) => {

        var u = new Auth;
        
        let x = await u.view("verifyEmail", req.params.token);
        console.log(x);
        if (x.rows.length === 0)
            return false;

        x = await u.getUser(x.rows[0].id);
        let user_doc = await x.body.json();
        console.log(user_doc);

        if (user_doc.unverifiedEmail.token == req.params.token)
        {
            user_doc.email = user_doc.unverifiedEmail.email;
            delete user_doc.unverifiedEmail;
        }

        u.setUser(user_doc);

        res.send({ ok: true });
    });
}




