import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Vital from '../models/Vital.js';

const router = express.Router();

// GET /api/users/doctors – List all active doctors (patients can see)
router.get('/doctors', protect, async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const query = { role: 'doctor', isActive: true };
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
      ];
    }
    const doctors = await User.find(query).select('-password').limit(50);
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
});

// GET /api/users – Admin: list all users
router.get('/', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/stats – Admin dashboard stats
router.get('/stats', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'doctor' }),
        User.countDocuments({ role: 'patient' }),
        Appointment.countDocuments(),
        User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
      ]);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      recentUsers,
      appointmentsByStatus,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role – Admin: change user role
router.put('/:id/role', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Role updated.', user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/status – Admin: activate/deactivate
router.put('/:id/status', protect, requireRole('admin'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    next(err);
  }
});

export default router;
