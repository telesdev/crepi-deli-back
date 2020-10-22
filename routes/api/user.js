const express = require('express');
const User = require('../../models/user');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth')
const bcrypt = require('bcrypt');
const MSGS = require('../../messages')


// @route    GET /user
// @desc     LIST user
// @access   Private
router.get('/', auth, async (req, res, next) => {
    try {
      const user = await User.find({})
      res.json(user)
    } catch (err) {
      console.error(err.message)
      res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
  })

// @route    GET /user/:userId
// @desc     DETAIL user
// @access   Private
router.get('/:userId', auth, async (req, res, next) => {
  try {
    const user = await User.findOne({_id : req.params.userId})
    if (user) {
      res.json(user)
    } else {
      res.status(404).send({ "error": MSGS.USER404 })
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send({ "error": MSGS.GENERIC_ERROR })
  }
})

// @route    POST /user
// @desc     CREATE user
// @access   Public
router.post('/', [
    check('email', 'Email não é válido').isEmail(),
    check('name', 'Nome não é válido').isLength({min : 3}).isAlpha(['pt-BR']),
    check('password', 'A senha deverá conter 6 ou mais caracteres').isLength({min:6})
  ], async (req, res, next) => {
    try {
      let { name, email, password } = req.body
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      } else {
        let user = new User({ name, email, password })
  
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
  
        await user.save()
        if (user.id) {
          res.json(user);
        }
      }
    } catch (err) {
      console.error(err.message)
      res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
  })

// @route    PATCH /user/:userId
// @desc     PARTIAL EDIT user
// @access   Public
router.patch('/:userId', [], async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).send({ errors: errors.array() })
        return
      }
      const id = req.params.userId
      const salt = await bcrypt.genSalt(10)
      
      let bodyRequest = req.body
  
      if(bodyRequest.password){
        bodyRequest.password = await bcrypt.hash(bodyRequest.password, salt)
      }
      const user = await User.findByIdAndUpdate(id, { $set: bodyRequest }, { new: true })
      if (user) {
        res.send(user)
      } else {
        res.status(404).send({ error: MSGS.USER404 })
      }
    } catch (err) {
      console.error(err.message)
      res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})

// @route    DELETE /user/:userId
// @desc     DELETE user
// @access   Public
router.delete('/:userId', async(req, res, next) => {
  try {
    const user = await User.findOneAndDelete({_id : req.params.userId})
    if (user) {
      res.json(user)
    } else {
      res.status(404).send({ "error": MSGS.USER404 })
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send({ "error": MSGS.GENERIC_ERROR })
  }
})


module.exports = router;
