import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Document from '../models/Document.js';
import { analyzeImage } from '../services/gemini.js';

const router = express.Router();

// POST /api/documents/upload
router.post('/upload', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const { buffer, mimetype, originalname, size } = req.file;
    const base64 = buffer.toString('base64');

    // Send to Gemini for OCR + data extraction
    const { text, parsedData } = await analyzeImage(base64, mimetype);

    const doc = await Document.create({
      userId: req.user._id,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      extractedText: text,
      parsedData: parsedData || {},
      documentType: parsedData?.documentType || 'other',
      fileData: `data:${mimetype};base64,${base64}`,
      isProcessed: true,
    });

    res.status(201).json({
      message: 'Document uploaded and analyzed.',
      document: doc,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents
router.get('/', protect, async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user._id })
      .select('-fileData -extractedText')
      .sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    res.json({ document: doc });
  } catch (err) {
    next(err);
  }
});

// PUT /api/documents/:id – Update parsed data
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { parsedData, documentType } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { parsedData, documentType },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    res.json({ message: 'Document updated.', document: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Document deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
