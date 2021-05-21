const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('./db/mongoose')
const path = require('path')
const userRouter = require('./routers/user')
const subjectRuter = require('./routers/subject')
const qestionRouter = require('./routers/question')
const app = express()
const directory = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(directory));
app.use(express.json())
app.use(bodyParser.json({ limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true}))
app.use(cors())
app.use(userRouter)
app.use(subjectRuter)
app.use(qestionRouter)

const port = process.env.PORT




module.exports = app