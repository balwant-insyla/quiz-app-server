const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 9,
            validate(value) {
                if(value.toLowerCase().includes('password')) {
                    throw new Error('Password can not contain "password".')
                }
            }
        },
        isVerify: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            unique: false,
            enum: ['admin', 'principal', 'teacher', 'student'],
            default: 'student'

        },
        avatar: {
            type: String,
            trim:true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if(!validator.isEmail(value)){
                    throw new Error('Invalid e-mail.')
                }
            }
        },
        displayName: {
            type: String,
            trim:true
        },
        mobile: {
            type: String,
            unique: true,
            trim: true,
            // validate(value) {
            //     if(!validator.isMobilePhone(value)) {
            //         throw new Error('Invalid mobile number.')
            //     }
            // }   
        },
        address: {
            type: String,
            trim:true 
        },
        city: {
            type: String,
            trim:true
        },
        state: {
            type: String,
            trim:true
        },
        country: {
            type: String,
            trim:true
        },
        zipCode: {
            type: String,
            trim:true
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
        
}, {
    timestamps: true
})
userSchema.virtual('question', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.virtual('result', {
    ref: 'Result',
    localField: '_id',
    foreignField: 'student'
})
userSchema.virtual('subject', {
    ref: 'Subject',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {

    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    //delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    user.save()
    return token
}
//This function is not in use 
userSchema.statics.findByCredentials = async (email, mobile, password) => {
    let user = this
    if(email) {
        user = await User.findOne({ email })
    } else if(mobile) {
        user = await User.findOne({ mobile })
    }

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

next()
})

const User = mongoose.model('User', userSchema)

module.exports = User