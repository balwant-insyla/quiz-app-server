const mongoose = require('mongoose')
const validator = require('validator')

const levelSchema = mongoose.Schema({
    level: {
        type: String,
        unique: true,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const Level = mongoose.model('level', levelSchema)

module.exports = Level