import express from "express";
import http from "http";
import {Server} from "socket.io"
import session from 'express-session';
import bodyParser from 'body-parser'
import path from 'path';
import fs from 'fs';

import createRoutes from "./Server/routes.js";
import socketHandler from "./Server/socket-handler.js";
import db, {cb} from './Server/database.js';

const app = express();
const server = http.createServer(app);
const dir = path.resolve()
const store = new session.MemoryStore()
const port = process.env.PORT || 4000 || 4004;
const secret = process.env.COOKIE_SECRET || "moshimoshi69420"
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const sessionMiddleware = session({
    secret: secret,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    saveUninitialized: false,
    store
});
const io = new Server(server, {
    allowRequest: (req, callback) => {
        // with HTTP long-polling, we have access to the HTTP response here, but this is not
        // the case with WebSocket, so we provide a dummy response object
        const fakeRes = {
            getHeader() {
                return [];
            },
            setHeader(key, values) {
                req.cookieHolder = values[0];
            },
            writeHead() {},
        };
        sessionMiddleware(req, fakeRes, () => {
            if (req.session) {
                // trigger the setHeader() above
                fakeRes.writeHead();
                // manually save the session (normally triggered by res.end())
                req.session.save();
            }
            callback(null, true);
        });
    },
});

io.use(wrap(sessionMiddleware));
app.use(express.static(dir + '/Public'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sessionMiddleware)

createRoutes(app, dir, {store, io});

server.listen(port, async () => {

    console.clear()
    console.log('Initializing...')
    console.log(`Listening on port ${port}.`);
    // await onload()

});

io.engine.on("initial_headers", (headers, req) => {
    if (req.cookieHolder) {
        headers["set-cookie"] = req.cookieHolder;
        delete req.cookieHolder;
    }
});

io.on('connection', async (socket) => {
    socketHandler(socket, io, store)
});

async function onload () {
    console.log(await db.set('password_resets', []))
    console.log('Done...')
}

async function writeDummyPosts () {

    let data = {
        author: 'goofy_ahh_author',
        authorLink: '/users/goofy_ahh_author',
        title: 'sussy amongus sightings',
        image: 'https://i.kym-cdn.com/photos/images/facebook/001/457/778/74c.jpg',
        text: `Lorem ipsum dolor sit amet. This post is about stuff!! Look at picture of Mr. Bruh!!!1!1!`,
        url: `/articles/goofy_ahh_author/sussy-amongus-sightings-${Date.now()}`
    }
    // return console.log(JSON.stringify(data))
    for (let i=0; i<20; i++) {
        fs.writeFileSync(`./Public/Posts/dummy-post-${i}.txt`, JSON.stringify(data))
    }

}

writeDummyPosts()