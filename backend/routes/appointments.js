import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/appointments – Get appointments for current user (role-aware)
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const query = {};

    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (req.user.role === 'doctor') query.doctorId = req.user._id;

    if (status) query.status = status;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email avatar phone age gender')
      .populate('doctorId', 'name email avatar specialization consultationFee')
      .sort({ date: -1 })
      .limit(50);

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments – Book appointment
router.post('/', protect, requireRole('patient', 'admin'), async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, type, symptoms, notes } = req.body;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Doctor, date, and time slot are required.' });
    }

    // Check if slot is already taken
    const existing = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) return res.status(409).json({ message: 'This time slot is already booked.' });

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'consultation',
      symptoms,
      notes,
    });

    await appointment.populate('patientId', 'name email avatar');
    await appointment.populate('doctorId', 'name email specialization');

    // Real-time Socket.io notification
    if (req.io) {
      req.io.to(`doctor_${doctorId}`).emit('appointment-booked', {
        appointment,
        message: `New appointment from ${req.user.name}`,
      });
    }

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id – Update status (doctor confirms/cancels)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { status, notes, prescription } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    // Only involved parties can update
    const isDoctor = appointment.doctorId._id.toString() === req.user._id.toString();
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;
    await appointment.save();

    // Notify patient in real-time
    if (req.io) {
      req.io.to(`patient_${appointment.patientId._id}`).emit('appointment-updated', {
        appointment,
        message: `Appointment ${status} by Dr. ${appointment.doctorId.name}`,
      });
    }

    res.json({ message: 'Appointment updated.', appointment });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });

    const isOwner = appt.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Access denied.' });

    await appt.deleteOne();
    res.json({ message: 'Appointment cancelled.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/doctor/:doctorId/slots – Get available slots
router.get('/doctor/:doctorId/slots', protect, async (req, res, next) => {
  try {
    const { date } = req.query;
    const allSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
      '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

    const booked = await Appointment.find({
      doctorId: req.params.doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    res.json({ availableSlots, bookedSlots });
  } catch (err) {
    next(err);
  }
});

export default router;
