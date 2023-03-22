import fs from 'fs'

function createPost (req, res, dir) {

    const body = req.body

    if (body.password !== 'maozedong') return res.redirect('/super-secret-endpoint-to-create-a-post?wrong-password=true')

    let date = Date.now().toString()
    date = date.substring(0, date.length-3)

    const data = {
        author: body.author,
        authorLink: body.authorLink,
        title: body.title,
        image: body.image,
        content: body.content,
        url: `/article/${body.title.toLowerCase().replaceAll(' ', '-')}-${date}`
    }

    console.log(data);

    fs.writeFileSync(`./Public/Posts/${body.title.toLowerCase().replaceAll(' ', '-')}-${date}.txt`, JSON.stringify(data))

    res.redirect(data.url);

}

export default createPost