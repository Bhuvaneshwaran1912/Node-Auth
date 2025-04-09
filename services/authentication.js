require('dotenv').config();
const jwt = require('jsonwebtoken');
 
authenticateToken = (req, res, next) => {    
    const authHeader = req.headers['authorization']
    const apiKey = req.headers['x-api-key'];
    const token = authHeader && authHeader.split(' ')[1]
    
    if (token == null) {
        return res.status(401).json({ message: 'UnAuthorized User !' });
    }

    if (!apiKey || apiKey !== process.env.ACCESS_TOKEN) {
        return res.status(401).json({ message: 'Invalid or missing API Key' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, results) => {        
        if (err) {
            return res.sendStatus(403);
        }
        res.locals = results;
        next();
    })
}

module.exports = { authenticateToken: authenticateToken }