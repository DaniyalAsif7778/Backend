import mongoose from "mongoose"

  const userSchema = new  mongoose.Schema({



},{timeStamps:true})



export const User = mongoose.model("User",userSchema)