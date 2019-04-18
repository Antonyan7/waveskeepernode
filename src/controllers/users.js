const bcrypt = require('bcrypt');
const sha256 = require('crypto-js/sha256');
const User = require('../models/user');
const mail = require('../../mail');
const smartContractHelper = require('../helpers/smartContractHelper');


exports.createUser = (req, res) => {
  const { email, publicKey } = req.body;
  bcrypt.hash('testing123', 10, (error, hash) => {
    if (error) {
      return res.status(500).json({
        error,
      });
    }
    const user = new User({
      email,
      publicKey,
      password: hash,
      isVerified: 'false',
      verificationToken: sha256(email),
    });
    user.save((err, result) => {
      if (err) {
        console.log(err);
      } else {
        mail.main({
          token: result.verificationToken,
          email,
        }).catch(console.error);
        res.status(201).json({
          message: 'User Created',
        });
      }
    });
  });
};

exports.verifyEmail = (req, res, next) => {
  User.findOne({ verificationToken: req.params.token }, async (err, user) => {
    if (err) {
      next(err);
    } else {
      req.user = user;
      await smartContractHelper.createContract(user.publicKey);
      res.status(201).json({
        message: 'User Created',
      });
      next();
    }
  });
};

exports.getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) {
      return next(err);
    }
    return res.json(users);
  });
};