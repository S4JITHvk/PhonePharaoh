const mongoose=require('mongoose')
const bcrypt = require("bcrypt");
require("../config/DBconnection");
const { Schema } = mongoose;


const adminSchema = new Schema({
    email: { type: String },
    password: { type: String ,select: true},
})


const superadmin = mongoose.model('superadmin', adminSchema);


module.exports = superadmin;



// const newSuperadmin = new superadmin({
//   email: 'phonepharaoh04@gmail.com',
//   password: '1234', 
// });

// // Hash the password before saving
// bcrypt.hash(newSuperadmin.password, 10, (err, hash) => {
//   if (err) {
//     console.error('Error hashing the password:', err);
//     return;
//   }

//   newSuperadmin.password = hash; // Replace the plain-text password with the hashed password

//   newSuperadmin.save()
//     .then(result => {
//       console.log('Superadmin saved:', result);
//     })
//     .catch(error => {
//       console.error('Error saving superadmin:', error);
//     });
// });
