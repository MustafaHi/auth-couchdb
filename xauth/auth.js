// import { isMethodDeclaration } from "typescript";
// import { request } from "undici"
require("dotenv").config();
const request = require("undici").request;
const crypto  = require("crypto");
// import {crypto} from "crypto";

const utils = {
    validateEmail: (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
    generateID: () => { return crypto.randomBytes(16).toString("hex"); }
}



class Auth {
    http;
    crypto;
    address = process.env.ADDRESS;
    constructor() {
        this.http = request;
        this.crypto = crypto;
    }

    async request(method, path, body = {}, params = {}) {
        var link = new URL(this.address + "/" + path);
        Object.keys(params).forEach(k => link.searchParams.set(k, params[k]));
        return this.http(
            link.toString(),
            {
                method: method,
                headers: { "Content-Type": "application/json", "Authorization": "Basic " + process.env.COUCHDB_AUTH },
                body: JSON.stringify(body)
            }
        );
    }

    //| Query CouchDB view by key
    //| return {id: user-id, key, value}
    async view(view, key) {
        let x = await this.request("GET", `${process.env.USERS_DB}/_design/auth/_view/${view}`, {}, {"key": `"${key}"`});
        return x.body.json();
    }

    //| Take Email, 
    //| return {id: user-id, key: email, value: verified}
    async findUser(email) {
        console.log(email);
        // let r = await this.request("GET", process.env.USERS_DB + "/_design/auth/_view/email", {}, {"key": `"${email}"`});
        let r = await this.view("email", email);
        // let d = await r.body.json();
        return r.rows[0];
    }

    async setUser(user) {
        // var r = await this.request("PUT", user._id, user, { _rev: user._rev});
        let r = await this.request("PUT", process.env.USERS_DB + "/" + user._id, user);
        if (r.statusCode == 201)
            return true;
    }

    async getUser(userID) {
        return this.request("GET", process.env.USERS_DB + "/" + userID);
    }

    //| Delete all users inside the `sessions` object
    async clearSessions(sessions) {
        // bulk delete /_users doc
        if (sessions.length == 0) return;
        let list = sessions.map(s => s.id);
        let x = await this.request("POST", "_users/_all_docs", { keys: list });
        list = (await x.body.json()).rows;
        // list = list.rows;
        list = list.map(s => { if(!s.error) return { _id: s.id, _deleted: true, _rev: s.value.rev } });
        console.log(list);
        return this.request("POST", "_users/_bulk_docs", { docs: list });
    }

    async hashPassword(password, salt = "") {
        if (!salt) salt = this.crypto.randomBytes(16).toString("hex");
        return { derived_key: await this.crypto.pbkdf2Sync(password, salt, 1000, 20, "sha512").toString("hex"), salt };
    }

}


module.exports = { utils, Auth }

