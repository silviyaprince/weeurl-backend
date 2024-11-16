import { User } from "../models/user.js";
export function getUserByEmail(email){
    return User.findOne({
        email:email
    })
}

export function getUserById(userId){
    return User.findById(userId).select("_id username email")
}