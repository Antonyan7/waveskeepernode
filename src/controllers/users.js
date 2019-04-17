const User = require('../models/user')
const bcrypt = require('bcrypt')

exports.createUser = function (req, res, next) {
  console.log(req)
  console.log(req.body)
  bcrypt.hash('testing123', 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      })
    } else {
      const user = new User({
        email: req.body.email,
        password: hash,
        isVerified: 'false',
        verificationToken: ''
      })
      user.save(function (err) {
        if (err) {
          console.log(err)
        } else {
          res.status(201).json({
            message: 'User Created'
          })
        }
      })
    }
  })
}

exports.getAllUsers = function (req, res, next) {
  User.find(function (err, users) {
    if (err) {
      next(err)
    } else {
      res.json(users)
    }
  })
}
