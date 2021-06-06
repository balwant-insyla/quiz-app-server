const express = require('express')
const mongoose = require('../db/mongoose')
const Question = require('../models/question')
const auth = require('../middleware/auth')
const Level = require('../models/level')
const router = new express.Router()


//Create Question

router.post('/questions', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        const question = new Question({
            ...req.body,
            owner: req.user._id
        })
        const getLevel = await Level.findOne({level: req.body.level})
        
        try {
            await question.save()
            
            if(!getLevel) {
                const level  = new Level({level: req.body.level})
                await level.save()
            }
            
            res.send(question)
        } catch(e) {
            //console.log(e)
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})
// Get all questions
router.get('/questions/all', auth, async (req, res)=> {
    if(req.user.role === 'admin') {
         try {
            await req.user.populate({
                path: 'question'
            }).execPopulate()
            res.status(200).send(req.user.question)
         } catch (e) {
            res.status(500).send({error: e})
         }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})
//Read Questions - 20 questions based on subject and level on random basis

router.get('/questions', auth, async (req, res)=> {
    try{
        if(req.user.role === 'student') {
            //const questions = await Question.find({subject: req.query.subject, level: req.query.level}).limit(20)
          //console.log(`${req.query.subject} ${req.query.level} ${req.query.size}`)
           const pipeline =[
               
               { 
                   '$match': {subject: req.query.subject, level: req.query.level}
               },
               {
                   '$sample': { size: parseInt(req.query.size)} //size the total questions requested
               }
           ]
           const questions = await Question.aggregate(pipeline)
           //console.log(pipeline)
           if(questions.length === 0) {
               return res.send().status(404)
           }
           //console.log(JSON.stringify(questions))
           res.send(questions)
       } else {
           res.status(401).send({error: 'Unauthorized Access'})
       }
    } catch(e) {
        res.status(500).send({error: e})
    }
    
})

//Update Question
router.patch('/questions/:id', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'statements', 'options', 'level', 'subject']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation) {
            return res.status(400).send({error: 'Invalid updates!'})
        }
        try {
            const question = await Question.findOne({_id: req.params.id, owner: req.user._id})
            const level = question.level
            if(req.body.level) {
                if(level !== req.body.level) {
                    const getLevel = await Level.findOne({level: req.body.level})
                    if(!getLevel) {
                        const level  = new Level({level: req.body.level})
                        await level.save()
                    }
                    
                }
            }
            
        if(!question) {
            return res.status(404).send({error: 'Question not found.'})
        }
        updates.forEach((update) => question[update] = req.body[update])
        await question.save()
        res.send(question)
        } catch(e) {
            //console.log(e)
            res.status(500).send({error: e})
        }
        
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})


//Delete Question

router.delete('/questions/:id', auth, async (req, res) => {
    if(req.user.role === 'admin') {

        try {
            const question = await Question.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
            if(!question) {
                return res.status(404).send({error: 'Question not found.'})
            }
            res.send(question)
        } catch (e) {
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})
module.exports = router