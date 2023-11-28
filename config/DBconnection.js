const mongoose = require('mongoose')

require('dotenv').config()
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((res) => {
    console.log(`database connected successfully`);
})
.catch((err) => {
    console.log(`an error occured during the connection establishing` + err);
})

module.exports = mongoose;