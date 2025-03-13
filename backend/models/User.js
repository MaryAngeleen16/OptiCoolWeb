const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateCode, sendEmail } = require('../utils/mailer');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, 'Please provide your name'],
        maxLength: [30, 'Your name should not be longer than 30 characters'],
        minLength: [5, 'Your name must have more than 5 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, 'Your password must be longer than 6 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },

    isActive: {
        type: Boolean,
        default: false, // Default to false so users are inactive until logged in
    },
    isApproved: {
        type: Boolean,
        default: false, // Default to false so users are not approved until admin approves
    },
    resetPasswordCode: String,
    resetPasswordCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.pre(["updateOne", "findByIdAndUpdate", "findOneAndUpdate"], async function (next) {

    const data = this.getUpdate();

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    next()

});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.comparePassword = async function (inputtedPassword) {
    return await bcrypt.compare(inputtedPassword, this.password);
}

userSchema.methods.getResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
}

userSchema.methods.getResetPasswordCode = async function () {
    const code = await generateCode(6);
    this.resetPasswordCode = code.trim();
    this.resetPasswordCodeExpire = Date.now() + 5 * 60 * 1000;
    return code;
}


// Method to set user as active when they log in
userSchema.methods.setActive = async function () {
    this.isActive = true;
    await this.save();
}

// Method to set user as inactive when they log out
userSchema.methods.setInactive = async function () {
    this.isActive = false;
    await this.save();
}



userSchema.methods.sendResetPasswordCode = async function () {
    await sendEmail({
        email: this.email,
        subject: 'OptiCool - Reset password code',
        message: `This is your verification code ${this.resetPasswordCode}. This will be valid in 5 minutes`
    })
}

userSchema.methods.verifyCode = async function (inputtedCode) {

    if (this.resetPasswordCodeExpire < Date.now()) {
        return 'expired'
    }

    if (this.resetPasswordCode !== inputtedCode) {
        return 'wrong'
    }

    this.resetPasswordCode = null
    this.resetPasswordCodeExpire = null
    this.save();

    return 'success'

}



module.exports = mongoose.model('User', userSchema)