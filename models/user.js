import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isBlocked:{
        type: Boolean,
        required: true,
        default:false
    },
    role:{
        type: String,
        required: true,
        default: "customer"
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    }
})

const User = mongoose.model('users', userSchema)

export default User