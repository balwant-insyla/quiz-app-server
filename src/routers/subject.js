const express = require('express')
require('../db/mongoose')
const auth = require('../middleware/auth')
const Subject = require('../models/subject')

const router = new express.Router()

// Create Subject - save subject

router.post('/subjects', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        const subject = new Subject({
            ...req.body,
            owner: req.user._id
        })
        try {
            await subject.save()
            res.status(201).send(subject)
        } catch (e) {
            res.status(400).send(e)
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})

// Read Subject - Get list of all subjects

router.get('/subjects', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        try {
            await req.user.populate({
                path: 'subject'
            }).execPopulate()
            res.status(200).send(req.user.subject)
        } catch (e) {
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})


//Update subject

router.patch('/subjects/:id', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        try {
            const updates = Object.keys(req.body)
            const allowedUpdates = ['name', 'description', 'time']
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
            if(!isValidOperation) {
                return res.status(400).send({error: 'Invalid updates!'})
            }

            const subjectId = req.params.id
            const subject = await Subject.findOne({ _id: subjectId, owner: req.user._id})

            if(!subject) {
                return res.status(404).send({error: 'Subject not found.'})
            }
            updates.forEach((update) => subject[update] = req.body[update])
            await subject.save()
            res.status(200).send(subject)

        } catch(e) {
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }
})

//Delete Subject

router.delete('/subjects/:id', auth, async (req, res) => {
    if(req.user.role === 'admin') {
        try {
            const subject = await Subject.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
            if(!subject) {
                return res.status(404).send({error: 'Subject not found.'})
            }
            res.send(subject)
        } catch (e) {
            res.status(500).send({error: e})
        }
    } else {
        res.status(401).send({error: 'Unauthorized Access'})
    }

})
module.exports = router