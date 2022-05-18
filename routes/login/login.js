'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//|/ Login User
//| 01 take `email, `password, and optionally device `name
//| 02 get user with this email and confirm it's verified
//| 03 confirm that provided password match user password
//| 04 generate user object with unique id and password
//| 05 register session in the x.auth user
//| 06 return the new user access details
//|\

module.exports =  async function (fastify, opts) {
    fastify.post('/', async (req, res) => {
        let { email, password, name } = res.request.body;
        
        if (!password || !utils.validateEmail(email))
            return res.send(400).send
                ({
                    error: "bad_request",
                    message: "give correct parameters"
                });

        var u = new Auth;
        
        let x = await u.findUser(email);
        if(!x)
            return res.code(404).send
                ({
                    error: "not_found",
                    message: "no such user with this email"
                });
    
        if (x.value == false)
            return res.code(400).send
                ({
                    error: "unverified",
                    message: "this user is not verified"
                });


        // validate password
        x = await u.getUser(x.id);
        let user_doc = await x.body.json();
        console.log(user_doc);
        password = await u.hashPassword(password, user_doc.access.local.salt);

        if (password.derived_key !== user_doc.access.local.derived_key) {
            console.log("failed!");
            return res.code(400).send
                ({
                    error: "bad_password",
                    message: "give correct password"
                });
        }
        console.log("passed!");

        
        const user =
            {
                name: crypto.randomUUID().replaceAll("-", ""),
                password: crypto.randomBytes(16).toString("hex"),
                owner: user_doc._id,
                type: "user",
                roles: user_doc.roles
            };
        user._id = "org.couchdb.user:" + user.name;
        console.log(user);
        
        if (!user_doc.sessions)
             user_doc.sessions = [];
        user_doc.sessions.push
            ({
                id: user._id,
                ip: req.ip,
                name,
                created: Date.now()
            });
        u.setUser(user_doc);
        
        x = await u.request("PUT", "_users/" + user._id, user);
        console.log(await x.body.json());
        
        res.code(200).send
            ({
                ok: true,
                token: user.name + "::" + user.password
            });
    });
}




