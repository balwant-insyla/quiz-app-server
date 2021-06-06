const mongoose = require("mongoose")
const validator = require('validator')

const questionSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,

    },
    statements: [
        {
            text: {
                type: String,
            }

        }],
    options : [{
        text: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true,
            default: false
        }
    }],    
    level: {
        type: String,
        required: true,
        default: 'level 0'
    },
    subject: {
        type: mongoose.Schema.Types.String,
        required: true,
        ref: 'Subject'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    

},{
    timestamps: true
})
questionSchema.virtual('result', {
    ref: 'Result',
    localField: '_id',
    foreignField: '_id'
})
const Question = mongoose.model('Question', questionSchema)

module.exports = Question