
const app = require('./app.js')
const port = process.env.PORT


//Listening at server
app.listen(port, () => {
    console.log('server is up and running on port '+ port)
})