import express from 'express';
import { protect } from '../middleware/auth.js';
import Vital from '../models/Vital.js';

const router = express.Router();

// POST /api/vitals – Add a vital reading
router.post('/', protect, async (req, res, next) => {
  try {
    const { type, value, valueSystolic, valueDiastolic, date, notes } = req.body;
    if (!type || value === undefined) {
      return res.status(400).json({ message: 'Type and value are required.' });
    }

    const vital = await Vital.create({
      userId: req.user._id,
      type,
      value,
      valueSystolic,
      valueDiastolic,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    res.status(201).json({ message: 'Vital recorded.', vital });
  } catch (err) {
    next(err);
  }
});

// GET /api/vitals – Get vitals with optional type/date filter
router.get('/', protect, async (req, res, next) => {
  try {
    const { type, days = 30 } = req.query;
    const query = {
      userId: req.user._id,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    };
    if (type) query.type = type;

    const vitals = await Vital.find(query).sort({ date: 1 });
    res.json({ vitals });
  } catch (err) {
    next(err);
  }
});

// GET /api/vitals/trends – Aggregated trends per type
router.get('/trends', protect, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trends = await Vital.aggregate([
      { $match: { userId: req.user._id, date: { $gte: since } } },
      {
        $group: {
          _id: '$type',
          avg: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          latest: { $last: '$value' },
          count: { $sum: 1 },
          latestDate: { $last: '$date' },
          unit: { $last: '$unit' },
          isAbnormal: { $last: '$isAbnormal' },
        },
      },
    ]);

    res.json({ trends });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vitals/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Vital.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Vital record deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
