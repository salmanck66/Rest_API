import { userSignUp } from "../helpers/signInUp.mjs"

export const signup = async (req,res)=>{
    try {
    let signupDone = await userSignUp(req.body)
    if(signupDone.exist)
        {
            res.status(200).json("Mail Id Already Exist ,Please Signup With Different Mail ID")
        }else
        {
            res.status(200).json("User Registration Successfull")
        }
    } catch (error) {
        
    }
}
export const home = async (req,res)=>{
    res.status(200).json("Connected")
}