const mongoose = require('mongoose')

const connectDB = (url) => {
  return  mongoose.connect(url, 
    console.log('db is connected')
  )
}

module.exports = connectDB
