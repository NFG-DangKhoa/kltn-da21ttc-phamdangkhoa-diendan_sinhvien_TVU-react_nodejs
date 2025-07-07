const express = require('express');
const router = express.Router();
const marqueeController = require('../controllers/marqueeController');
const { protect, admin } = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

// Admin routes
router.post('/', protect, isAdminMiddleware, marqueeController.createMarquee);
router.get('/', protect, isAdminMiddleware, marqueeController.getMarquees);
router.put('/:id', protect, isAdminMiddleware, marqueeController.updateMarquee);
router.delete('/:id', protect, isAdminMiddleware, marqueeController.deleteMarquee);
router.put('/activate/:id', protect, isAdminMiddleware, marqueeController.activateMarquee);
router.put('/deactivate/:id', protect, isAdminMiddleware, marqueeController.deactivateMarquee);

// Public route
router.get('/active', marqueeController.getActiveMarquee);

module.exports = router;
