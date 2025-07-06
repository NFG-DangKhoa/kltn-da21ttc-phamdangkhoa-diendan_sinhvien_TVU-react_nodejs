const Marquee = require('../models/Marquee');

// Create a new marquee
exports.createMarquee = async (req, res) => {
    try {
        const { content, backgroundColor } = req.body;
        const marquee = new Marquee({ content, backgroundColor });
        await marquee.save();
        res.status(201).json(marquee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all marquees
exports.getMarquees = async (req, res) => {
    try {
        const marquees = await Marquee.find().sort({ createdAt: -1 });
        res.json(marquees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get the active marquee
exports.getActiveMarquee = async (req, res) => {
    try {
        const activeMarquee = await Marquee.findOne({ active: true });
        res.json(activeMarquee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a marquee
exports.updateMarquee = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, backgroundColor } = req.body;
        const updatedMarquee = await Marquee.findByIdAndUpdate(id, { content, backgroundColor }, { new: true });
        res.json(updatedMarquee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a marquee
exports.deleteMarquee = async (req, res) => {
    try {
        const { id } = req.params;
        await Marquee.findByIdAndDelete(id);
        res.json({ message: 'Marquee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set a marquee to active
exports.activateMarquee = async (req, res) => {
    try {
        const { id } = req.params;
        // Deactivate all other marquees
        await Marquee.updateMany({}, { active: false });
        // Activate the selected marquee
        const activeMarquee = await Marquee.findByIdAndUpdate(id, { active: true }, { new: true });
        res.json(activeMarquee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Deactivate a marquee
exports.deactivateMarquee = async (req, res) => {
    try {
        const { id } = req.params;
        const deactivatedMarquee = await Marquee.findByIdAndUpdate(id, { active: false }, { new: true });
        res.json(deactivatedMarquee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
