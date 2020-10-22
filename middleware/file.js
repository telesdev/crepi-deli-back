const MSGS = require('../messages')
const AWS = require('aws-sdk')
const config = require('config')
const fs = require('fs')

module.exports = async function (req, res, next) {
    try {
        const BUCKET_NAME = process.env.S3_BUCKET_NAME || config.get('S3_BUCKET_NAME')

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: process.env.AWS_SECRET_KEY || config.get('AWS_SECRET_KEY')
        })

        if (!req.files){
            res.status(204).send({ "error" : MSGS.FILE_NOT_SENT})
        } else {
            let photo = req.files.photo
            const name = photo.name
            if (photo.mimetype.includes('image/')){
                
                await photo.mv(`./uploads/${name}`)

                const params = {
                    Bucket: BUCKET_NAME,
                    ACL: 'public-read',
                    Key: `product/${name}`, // File name you want to save as in S3
                    Body: fs.createReadStream(`./uploads/${name}`)
                }

                s3.upload(params, function(err, data) {
                    if (err) {
                        console.error(err)
                        res.status(500).send(err)
                    } else {
                        console.log(`Arquivo enviado com sucesso: ${data.Location}`)
                        fs.unlinkSync(`./uploads/${name}`)
                        next()
                    }
                })
            } else {
                res.status(400).send({ messages: MSGS.FILE_INVALID_FORMAT })
            }
        }
    } catch(err) {
        res.status(500).send({ "error" : err.message})
    }
}