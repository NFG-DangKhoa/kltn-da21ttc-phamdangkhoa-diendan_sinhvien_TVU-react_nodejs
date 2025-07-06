const express = require('express');
const router = express.Router();
const marqueeController = require('../controllers/marqueeController');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

// Admin routes
router.post('/', authMiddleware, isAdminMiddleware, marqueeController.createMarquee);
router.get('/', authMiddleware, isAdminMiddleware, marqueeController.getMarquees);
router.put('/:id', authMiddleware, isAdminMiddleware, marqueeController.updateMarquee);
router.delete('/:id', authMiddleware, isAdminMiddleware, marqueeController.deleteMarquee);
router.put('/activate/:id', authMiddleware, isAdminMiddleware, marqueeController.activateMarquee);
router.put('/deactivate/:id', authMiddleware, isAdminMiddleware, marqueeController.deactivateMarquee);

// Public route
router.get('/active', marqueeController.getActiveMarquee);

module.exports = router;
