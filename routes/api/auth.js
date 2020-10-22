const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const MSGS = require('../../messages')
const jwtToken = process.env.jwtSecret || config.get('jwtSecret')

// @route    POST /auth/
// @desc     Authenticate user & get token
// @access   Public
router.post('/', [
        check('email', MSGS.EMAIL_NOT_VALID).isEmail(),
        check('password', MSGS.PASSWORD_INVALID).exists()
    ], async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors : errors.array() })
        }
        const { email, password } = req.body

        try {
            let user = await User.findOne({ email }).select('id email name password')
            if (!user) {
                return res.status(404).json({ errors: [{ msg : MSGS.USER404}] })
            } else {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    return res.status(400).json({ errors : [{ msg : PASSWORD_INVALID }] })
                } else {
                    const payload = {
                        user: {
                            id: user.id,
                            name: user.name
                        }
                    }
                    jwt.sign(payload, jwtToken, { expiresIn : '5 days' },
                        (err, token) => {
                            if (err) throw err
                            payload.token = token
                            res.json(payload)
                        }
                    )
                }
            }
        } catch (err) {
            console.error(err.message)
            res.status(500).send(MSGS.GENERIC_ERROR)
        }
    }
)

module.exports = router