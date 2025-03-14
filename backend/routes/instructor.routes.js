const express = require('express');
const router = express.Router();
const { getInstructorDetails } = require('../controllers/instructor.controller');
const { authenticateUser } = require('../middleware/authentication');

router.get('/:id', authenticateUser, getInstructorDetails);

module.exports = router; 