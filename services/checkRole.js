require('dotenv').config();

checkRole = (req, res, next) => {
    if (res.locals.role == process.env.USER) {
        res.sendSattus(401)
    } else {
        next()
    }
}

module.exports = { checkRole: checkRole }