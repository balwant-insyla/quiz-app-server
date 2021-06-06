const express = require('express');
const Result = require('../models/result');
const auth = require('../middleware/auth');
const Question = require('../models/question');

const router = new express.Router()

//Save Result

router.post('/result', auth, async (req, res) => {
    if(req.user.role === 'student') {
        const result = new Result({
            ...req.body,
            student: req.user._id
        })
        try {
            await result.save()
            res.send(result)
        } catch(err) {
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})


 module.exports = router