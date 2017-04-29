const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String
})

mongoose.model('User', userSchema)
