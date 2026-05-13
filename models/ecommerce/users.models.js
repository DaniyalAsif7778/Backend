import mongoose from "mongoose"

  const userSchema = new  mongoose.Schema({

   userName:{
    type:String,
    unique:true,
    lowerCase:true,
    required:true,


   },

   email:{
    type:String,
    unique:true,
    lowerCase:true,
    required:true,


   },

    password:{
    type:String,
    unique:true,
    lowerCase:true,
    required:true,


   }

},{timestamps:true})



export const User = mongoose.model("User",userSchema)