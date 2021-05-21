const mongoose = require('mongoose')
const validator = require('validator')

const examSchema = mongoose.Schema({
    questions:[{
        questionId: {
            type: Object,
            required: true
        },
        selectedAnswer: {
            type: String
        }
    }],
    percentage: {
        type: String
    },
    level: {
        type: String
    }
},{
    timestamps: true
    
})

const Exam = mongoose.model('Exam', examSchema)

module.exports = Exam