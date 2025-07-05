// File: backend/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const imageController = require('../controllers/imageController');

router.post('/upload', upload.single('image'), imageController.uploadImage);

module.exports = router;
