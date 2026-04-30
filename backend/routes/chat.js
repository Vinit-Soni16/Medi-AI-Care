import express from 'express';
import { protect } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import { analyzeSymptoms } from '../services/gemini.js';

const router = express.Router();

// POST /api/chat/analyze – Send message, get Gemini response
router.post('/analyze', protect, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required.' });

    let session;
    if (sessionId) {
      session = await Chat.findOne({ _id: sessionId, userId: req.user._id });
    }
    if (!session) {
      session = new Chat({ userId: req.user._id, messages: [] });
    }

    // Build history for context
    const history = session.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const { text, isDemo } = await analyzeSymptoms(message, history);

    // Save messages
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'model', content: text });

    // Auto-generate title from first message
    if (session.messages.length === 2) {
      session.sessionTitle = message.substring(0, 60) + (message.length > 60 ? '...' : '');
    }

    await session.save();

    res.json({
      response: text,
      sessionId: session._id,
      isDemo,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/history – All sessions for user
router.get('/history', protect, async (req, res, next) => {
  try {
    const sessions = await Chat.find({ userId: req.user._id })
      .select('sessionTitle updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(30);

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:sessionId – Get single session messages
router.get('/:sessionId', protect, async (req, res, next) => {
  try {
    const session = await Chat.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json({ session });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/:sessionId
router.delete('/:sessionId', protect, async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.sessionId, userId: req.user._id });
    res.json({ message: 'Session deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
