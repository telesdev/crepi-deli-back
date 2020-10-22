const jwt = require('jsonwebtoken')
const config = require('config')
const MSGS = require('../messages')
const jwtToken = process.env.jwtSecret || config.get('jwtSecret')

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token')

    if (!token) {
        return res.status(401).json({ msg: MSGS.AUTH_NO_TOKEN })
    }
    try {
        jwt.verify(token, jwtToken, (error, decoded) => {
            if (error) {
                return res.status(401).json({ msg: MSGS.AUTH_INVALID_TOKEN })
            } else {
                req.user = decoded.user
                next()
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg : MSGS.GENERIC_ERROR })
    }
}