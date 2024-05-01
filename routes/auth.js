const express = require('express')
const router = express.Router()
const {registrationPage, login, getAllUsers} = require('../controllers/auth')

router.route('/register').post(registrationPage)
router.route('/login').post(login)
router.route('/users').get(getAllUsers)

module.exports = router