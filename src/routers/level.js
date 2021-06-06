const express = require('express')
const mongoose = require('../db/mongoose')
const auth = require('../middleware/auth')
const Level = require('../models/level')
const router = new express.Router()

router.get('/level', auth, async (req, res) => {
    try {
        const level  =  await Level.find().select('level')
        res.send(level)
 
     } catch(e) {
         res.status(500).send({error: e})
     }
})


module.exports = router