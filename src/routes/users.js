const express = require('express');

const router = express.Router();
const UsersController = require('../controllers/users');

router.route('/signup').post(UsersController.createUser);
router.route('/getUsers').get(UsersController.getAllUsers);
router.route('/user/auth').post(UsersController.createContract);
router.route('/user/verify/:token').get(UsersController.verifyEmail);

module.exports = router;
