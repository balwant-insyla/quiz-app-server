const mongoose = require('mongoose')
const validator = require('validator')

const resultSchema = mongoose.Schema({
    subject: {
        Type: String,
    },
    level: {
        type: String
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    questions: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
        //ref: 'Question',
        options: [{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            isChecked: {
                type: Boolean,
                default: false
            }
        }],
        attempted: {
            type: Number,
            default: -1
        },
    }],
    correctAnswers: {
        type: String,
    },
    negativeMarking: {
        type: Boolean,
        default: false
    },
    marks: {
        type: String,
    },
    percentage: {
        type: String
    },
    
},{
    timestamps: true
    
})

const Result = mongoose.model('Result', resultSchema)

module.exports = Result