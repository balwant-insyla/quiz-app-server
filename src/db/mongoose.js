const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
    
})
const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('database connected'))