import mongoose from "mongoose";

 const UserFormat  = new mongoose.Schema({
    userName:{type: String ,required:true},
    mail:{type: String ,required:true},
    phno:{type: String ,required:true},
    isAdmin:{type: Boolean ,default:false}
},{ timestamps: true, versionKey: false })

export const User = mongoose.model('user', UserFormat,'user');