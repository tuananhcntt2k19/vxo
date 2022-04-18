const express = require('express');
const router = express.Router();

// Auth Controller
const authController = require('../app/controllers/auth.controller');

router.get('/', authController.login);
router.post('/', authController.postLogin);

module.exports = router;