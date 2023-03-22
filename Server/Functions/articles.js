import fs from 'fs';

function getArticle(req, res, dir) {

    const article = req.params.article + '.txt';
    
    const articles = fs.readdirSync('./Public/Posts');
    
    const result = articles.find(a => a.toLowerCase() === article.toLowerCase());
    
    if (!result) return res.sendFile(dir + 'Static/not-found.html')

    return res.sendFile(dir + 'Dynamic/article-template.html');

}

export default getArticle