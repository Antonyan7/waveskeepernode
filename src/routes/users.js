const express = require('express');

const router = express.Router();
const UsersController = require('../controllers/users');

router.route('/user/create-user').post(UsersController.createUser);
router.route('/getUsers').get(UsersController.getAllUsers);
router.route('/user/verify/:token').get(UsersController.verifyEmail);

module.exports = router;
