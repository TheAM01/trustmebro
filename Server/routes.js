import login from "./Functions/login.js";
import writePost from "./Functions/create-post.js";
import register from './Functions/register.js'
import util from './util.js'
import db from "./database.js";
import fs from "fs";
import {CommentSchema} from "./builders.js";
import comment from "./Functions/comment.js";
import getNotes from "./Functions/get-notes.js";
import notesApi from "./Functions/notes-api.js";
import changePassword, {confirmCode} from "./Functions/change-password.js";
import {forgotPassword} from "./Functions/change-password.js";


function routes (app, dir, ext) {

    dir += '/Public/'

    // Static files

    app.get('/database_url', (req, res) => {

        if (parseInt(process.env.PRODUCTION) !== 1) return res.status(401)

        if (req.headers.auth_key !== process.env.AUTH_KEY) {
            return res.sendStatus(400)
        }

        res.status(200).send(process.env.REPLIT_DB_URL)

    })

    app.get('/', (req, res) => {
        res.sendFile(dir + 'Static/home.html')
    });

    app.get('/home', (req, res) => {
        res.sendFile(dir + 'Static/home.html')
    });

    app.get('/latest', (req, res) => {
        res.sendFile(dir + 'Static/latest.html')
    });

    app.get('/contact', (req, res) => {
        res.sendFile(dir + 'Static/contact.html');
    });

    app.get('/template', (req, res) => {
        if (req.query.override !== 'true') return res.sendFile(dir + 'Static/not-found.html')
        res.sendFile(dir + 'template.html')
    });

    // Notes n stuff

    app.get('/notes/:grade/:subject/:index', async (req, res) => {
        return getNotes(req, res, dir)
    });

    app.get('/api/:grade/:subject/:index', notesApi);

    app.get('/cdn/:file', (req, res) => {

        const path = `${dir}Assets/${req.params.file}`
        if (fs.existsSync(path)) {
            return res.sendFile(path)
        }
        res.sendStatus(404);

    });

    app.get('/policy/:category', (req, res) => {

        const path = `${dir}Policies/${req.params.category}.html`
        if (fs.existsSync(path)) {
            return res.sendFile(path)
        }
        return res.sendFile(dir + 'Static/not-found.html');

    });
    
    app.use((req, res) => {
        res.status(404);
        res.sendFile(dir + 'Static/not-found.html')
    });

    // app.get('/')

}

export default routes