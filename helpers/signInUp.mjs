import bcrypt from 'bcrypt'
import { User } from '../models/user.mjs'

export function userSignUp(userData)
{
    const {mail,password,username,phno} = userData
    return new Promise(async(resolve,reject)=>
    {
        try {
            const exist = User.findOne({mail})
            if(!exist)
                {
                    const hashed = await bcrypt.hash(password,10)
                    const user = new User({
                        userName : username,
                        mail : mail,
                        password : hashed,
                        phno : phno
                    }) 
                    user.save()
                    resolve({success:true,user})
                }else{
                    resolve({exist:true})
                }
        } catch (error) {
            reject(error)
        }
    })
}