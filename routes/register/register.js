'use strict'
const request = require("undici").request;
const crypto  = require("crypto");
const { Auth, utils } = require("../../xauth/auth.js");

//|/ Register User
//| 01 take name, email, password, and optionally salt, for precomputed passwords
//| 02 confirm there are NO user with this email
//| 03 hash the password if salt is not provided
//| 04 generate user object with unique id, access method, email confirmation token
//|\

module.exports =  async function (fastify, opts) {
    fastify.post('/', async (req, res) => {
        let { name, email, password, salt } = res.request.body;
        // console.log(name);

        // validate email

        if (!name || !email || !password || !utils.validateEmail(email)) {
            return res.code(400).send
                ({
                    error: "bad_request",
                    message: "give correct parameters"
                });
        }
        var u = new Auth;
        
        let x = await u.findUser(email);
        if (x !== false) {
            return res.code(400).send
                ({
                    error: x.value == true ? "already_exist" : "unverified",
                    message: "user with this email already exists"
                });
        }


        // validate password against constrains
        let local = await u.hashPassword(password, salt);

        const user = {
            _id: crypto.randomUUID().replaceAll("-", ""),
            name,
            created: new Date().toISOString(),
            roles: [this._id],
            access: {
                local
            },
            unverifiedEmail: {
                email,
                token: crypto.randomBytes(6).toString("hex"),
            }
        }
        console.log(user);
        
        x = await u.setUser(user);
        console.log(await x.body.json());
        if (x.statusCode == 201) {
            res.send({ ok: true });
        } else {
            res.send("check your self");
        }
    });
}




