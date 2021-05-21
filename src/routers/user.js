const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
require('../db/mongoose')
const router = new express.Router()
const auth =require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const { sendWelcomeEmail, sendDeleteEmail } = require('../emails/account')


//Sign up

router.post('/users', async (req, res) => {
    //const user = new User(req.body)
    const {firstName, lastName, mobile, email, password, confirmPassword} = req.body

    try {

        if(email) {
            const oldUser = await User.findOne({email})
            if(oldUser) return res.status(400).send({message: 'User with email already exist.'})
        } 
        if(mobile) {
            const oldUser = await User.findOne({mobile})
            if(oldUser) return res.status(400).send({message: 'User with mobile already exist.'})
        } 
        if(confirmPassword !== password) return res.status(400).send({message: 'password mismatch.'})

        const name = `${firstName} ${lastName}`
        const user = new User({name, email, mobile, password})
            await user.save()
            sendWelcomeEmail(user.email, user.name)
            const token = await user.generateAuthToken()
            res.status(201).send({ user, token })

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }

})
router.post('/users/login', async (req, res) => {
    const {email, mobile, password} = req.body
    try {
        let user = this
    if(email) {
        user = await User.findOne({ email })
    } else if(mobile) {
        user = await User.findOne({ mobile })
    }
    
    if (!user) return res.status(400).send({message: 'No User found!'})

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) return res.status(400).send({message: 'Invalid credentials!'})

        //const user = await User.findByCredentials(req.body.email, req.body.mobile, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token }).status(200)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send({ user: req.user })
})


router.patch('/users/me', auth, async (req, res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'displayName', 'mobile', 'address', 'city', 'state', 'country', 'zipCode', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})

    }
    try {

        //const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        
        res.send({ user: req.user })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)

        // if(!user) {
        //     return res.status(404).send()
        // }
        // res.send(user)
        await req.user.remove()
        sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// const upload = multer({
//     //dest: 'avatars',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
//             return cb(new Error('only image is premitted'))
//         }
//         //cb(new Error('only images are premitted'))
//         cb(undefined, true)
//     }
// })
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    }, 
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname)
    },
})
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if(allowedFileTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({ storage, fileFilter })

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    console.log(req.file)
    
    if(!req.file) {
        return res.status(404).send({ error: 'Please upload a file.'})
    } 
    req.user.avatar = req.file.filename
    await req.user.save()
    res.send({ user: req.user })
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

router.delete('/users/me/avatar', auth,  async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        
        if(!req.user || !req.user.avatar) {
            res.status(404).send({error: 'image not found'})
            //throw new Error()
        }

        //res.set('Content-Type', 'image/png')
        res.send(req.user.avatar)
    } catch (e)
    {
        res.status(500).send()
    }
})

//Get all the students
router.get('/users/students', auth, async (req, res) => {
    try {
        if(req.user.role === 'admin') {
            const users = await User.find({ role: 'student' }).exec()
            res.send(users)
        } else {
            res.status(401).send({error: 'Unauthorized Access'})
        }
    } catch (e) {
        res.status(500).send({error: e})
    }

})


module.exports = router