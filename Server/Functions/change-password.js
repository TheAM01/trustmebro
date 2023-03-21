import util from "../util.js";
import bcrypt from "bcryptjs";
import db from "../database.js";
import {mail} from "../mailer.js";

async function forgotPassword(req, res, dir) {

    const {email} = req.body
    if (!email) return res.redirect('/forgot-password?invalid_email=true');

    const user = await util.checkPersonByEmail(bcrypt.hashSync(email, 10));
    if (!user) return res.redirect('/forgot-password?invalid_email=true');

    const encryption = await bcrypt.hashSync(user.username, 7);

    const code = encryption.replaceAll('/', '%2F').replaceAll('$2a$07$', '');
    const resets = await db.get('password_resets');

    const duplicate = resets.find(r => r.email.toLowerCase() === email.toLowerCase());

    if (duplicate) return res.redirect('/forgot-password?check_inbox=true');

    console.log([code, user])

    resets.push({
        email: email,
        code: code
    })


    await db.set('password_resets', resets);
    const recipient = {
        name: "",
        email: email
    }

    console.log([resets, recipient])
    try {
        await mail("Parhle Fail Hojayega password reset", `We received a password reset request from you. Click the link below to reset.\nhttp://parhle.tk/reset-password/${code}/`, recipient)
    } catch (e) {
        console.log(e)
        return res.redirect('/forgot-password?error=true');
    }

    return res.redirect('/forgot-password?check_inbox=true');

};

async function confirmCode (req, res) {
    const code = req.params.code;
    console.log(code);

    const resets = await db.get('password_resets');

    const current = resets.find(r => r.code === code);

    console.log(current);

}


async function resetPassword (req, res, dir) {

    const {email} = req.body;
    if (!email) return res.redirect('/forgot-password?invalid_email=true');

    const user = util.checkPersonByEmail(email);
    if (!user) return res.redirect('/forgot-password?invalid_email=true');

    const encryption = await bcrypt.hashSync(user.username, 10)

    res.redirect('/forgot-password?continue=true');

}

export default resetPassword
export {forgotPassword, confirmCode}