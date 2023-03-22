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
        content: `Lorem ipsum dolor sit amet. This post is about stuff!! Look at picture of Mr. Bruh!!!1!1! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae diam non diam fringilla laoreet a id lorem. Vestibulum luctus convallis libero, a fermentum ante posuere nec. Pellentesque interdum ex ac massa maximus, et feugiat mi convallis. Morbi porta sem ac purus vehicula laoreet. Donec mattis odio quis pharetra egestas. Sed porta consequat purus vel ullamcorper. Sed quis velit et nunc elementum tempus eu quis ipsum. Aenean neque nulla, maximus tempor commodo quis, maximus ut lacus. In rutrum elit consequat dolor feugiat dapibus.

        Nullam elementum leo nec sodales tincidunt. Duis vel erat leo. Maecenas eget dui turpis. Nulla facilisi. Praesent molestie molestie ligula in pharetra. Duis ut est vel sem consectetur pharetra in a neque. Pellentesque et risus ut orci interdum faucibus nec nec nulla. Vivamus condimentum porta risus, ac tristique lorem egestas sed. Donec quam odio, tincidunt quis elementum eget, faucibus varius ipsum.
        
        Sed iaculis fermentum odio vitae ultricies. Nunc malesuada velit justo, ut finibus nisi ultricies id. Sed ipsum est, pharetra eu urna vitae, tristique blandit leo. Etiam enim nulla, scelerisque quis vestibulum et, tincidunt vel arcu. Nunc imperdiet dui a nisl sagittis mattis. Integer at tortor sed nibh convallis sodales at et libero. Donec eu accumsan nunc, sed fringilla arcu. Proin porta erat dui. Etiam orci augue, semper at augue id, tincidunt eleifend ipsum. Pellentesque ullamcorper diam eget vehicula cursus. Curabitur volutpat aliquet est, non pulvinar lorem egestas pulvinar.
        
        Maecenas a feugiat dolor. Curabitur ac congue purus. Sed non finibus lectus, nec varius odio. Proin dictum iaculis nisi at lobortis. Donec pretium augue purus, a dictum erat tempor vitae. Pellentesque vitae turpis sapien. Quisque tempor aliquam risus, eget faucibus augue iaculis vel.
        
        Duis in lorem a ante sollicitudin bibendum ornare et ipsum. Aliquam scelerisque risus sit amet enim semper, ac sollicitudin turpis luctus. Proin consequat suscipit enim sed aliquet. Integer lacinia neque sodales nisl tristique, nec dignissim leo bibendum. Donec pharetra felis mauris. Nunc ultrices enim vitae commodo aliquam. In hac habitasse platea dictumst. Nam et tortor sed urna imperdiet porta ut sit amet enim. Etiam ut ex vulputate, pretium lacus a, posuere dolor. Nullam facilisis in ligula quis venenatis. In molestie sem nec nisl condimentum aliquet. Etiam a ullamcorper ipsum, nec malesuada purus. Maecenas tristique lacus vitae est iaculis vulputate. Fusce quis nulla magna. Donec porttitor mauris ac dui auctor tempus. Etiam viverra dignissim justo a consequat.`,
        url: `/article/sussy-amongus-sightings-${Date.now()}`
    }
    // return console.log(JSON.stringify(data))
    for (let i=0; i<5; i++) {
        fs.writeFileSync(`./Public/Posts/sussy-amongus-sightings-${Date.now()}.txt`, JSON.stringify(data))
    }

}

writeDummyPosts()