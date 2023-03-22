import util from './util.js'
import fs from "fs";
import {CommentSchema} from "./builders.js";
import getArticle from "./Functions/articles.js";
import createPost from "./Functions/create-post.js";


function routes (app, dir, ext) {

    dir += '/Public/'

    // Static files

    app.get('/', (req, res) => {
        res.sendFile(dir + 'Static/home.html')
    });

    app.get('/home', (req, res) => {
        res.sendFile(dir + 'Static/home.html')
    });

    app.get('/latest', (req, res) => {
        res.sendFile(dir + 'Static/latest.html')
    });

    app.get('/disclaimer', (req, res) => {
        res.sendFile(dir + 'Static/disclaimer.html')
    })

    app.get('/contact', (req, res) => {
        res.sendFile(dir + 'Static/contact.html');
    });

    app.get('/template', (req, res) => {
        if (req.query.override !== 'true') return res.sendFile(dir + 'Static/not-found.html')
        res.sendFile(dir + 'template.html')
    });

    app.get('/article/:article', (req, res) => {
        return getArticle(req, res, dir);
    })

    app.get('/super-secret-endpoint-to-create-a-post', (req, res) => {
        return res.sendFile(dir + 'User/create-post.html')
    });

    app.post('/create_post', (req, res) => {
        createPost(req, res, dir);
    })

    // Notes n stuff

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

    

}

export default routes