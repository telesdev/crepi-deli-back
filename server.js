const express = require("express")
var bodyParser = require("body-parser")
var cors = require("cors")
const connectDB = require("./config/db")
const fileUpload = require('express-fileupload')
const app = express()
const PORT = process.env.PORT || 3001;


// Init Middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json())
app.use('./uploads', express.static('uploads'))


// Connect Database
connectDB()

app.use(fileUpload({ createParentPath: true }))

app.get('/', (req, res) => res.send('Oláaa!'))

app.use('/auth', require('./routes/api/auth'))
app.use('/category', require('./routes/api/category'))
app.use('/content', require('./routes/api/content'))
app.use('/file', require('./middleware/file'))
app.use('/product', require('./routes/api/product'))
app.use('/user', require('./routes/api/user'))


app.listen(PORT, () => { console.log(`App rodando na porta ${PORT}`) })
