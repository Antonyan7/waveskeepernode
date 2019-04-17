const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/users')

router.route('/signup').post(UsersController.createUser)
router.route('/getUsers').get(UsersController.getAllUsers)

module.exports = router
