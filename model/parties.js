const mongoose = require('mongoose')
const partySchema = new mongoose.Schema({
  name: String,
  date: Date,
  isInviteOnly: Boolean
})

mongoose.model('Party', partySchema)
