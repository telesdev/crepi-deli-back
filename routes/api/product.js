const express = require('express');
const Product = require('../../models/product');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth')
const file = require('../../middleware/file')
const MSGS = require('../../messages')
const config = require('config')


// @route    GET /product
// @desc     LIST product
// @access   Public
router.get('/', async (req, res, next) => {
    try {
        const product = await Product.find({})
        const BUCKET_PUBLIC_PATH = process.env.BUCKET_PUBLIC_PATH || config.get('BUCKET_PUBLIC_PATH')

        product.photo = `${BUCKET_PUBLIC_PATH}${product.photo}`
        res.json(product)
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})

// @route    GET /product:id
// @desc     DETAIL product
// @access   Public
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const product = await Product.findOne({ _id: id })
        if (product) {
            res.json(product)
        } else {
            res.status(404).send({ "error" : MSGS.PRODUCT404 })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})


// @route    POST /product
// @desc     CREATE product
// @access   Private
router.post('/', auth, file, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            req.body.photo = `uploads/${req.files.photo.name}`
            let product = new Product(req.body)
            await product.save()
            if (product.id) {
                const BUCKET_PUBLIC_PATH = process.env.BUCKET_PUBLIC_PATH || config.get('BUCKET_PUBLIC_PATH')
                product.photo = `${BUCKET_PUBLIC_PATH}${product.photo}`
                res.json(product);
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})

// @route    PATCH  /product:id
// @desc     PARCIAL UPDATE product
// @access   Public
router.patch('/:id', async (req, res, next) => {
    try {
        const product = await Product.findOneAndUpdate(req.params.id, { $set : req.body }, { new : true })
        if (product) {
            res.json(product)
        } else {
            res.status(404).send({ "error" : MSGS.PRODUCT404 })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})

// @route    DELETE  /product:id
// @desc     DELETE product
// @access   Public
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const product = await Product.findOneAndDelete({ _id: id })
        if (product) {
            res.json(product)
        } else {
            res.status(404).send({ "error" : MSGS.PRODUCT404 })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).send({ "error": MSGS.GENERIC_ERROR })
    }
})


module.exports = router;