// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
// const { getAllEvents, addOrUpdateEvent } = require('../controllers/eventController');
const { getAllEvents, addOrUpdateEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getAllEvents);
router.post('/', addOrUpdateEvent);
router.delete('/', deleteEvent); // 👈 Add this line

module.exports = router;
