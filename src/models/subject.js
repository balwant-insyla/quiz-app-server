const mongoose = require('mongoose')
const validator = require('validator')

const subjectSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    time: {
        type: Number,
        required: true,
        default: 30
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

subjectSchema.virtual('question', {
    ref: 'Question',
    localField: 'name',
    foreignField: 'subject'
})
const Subject = mongoose.model('Subject', subjectSchema)

module.exports = Subject