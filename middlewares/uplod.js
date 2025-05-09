const multer = require('multer');
const sharp = require('sharp');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const storage = multer.memoryStorage();
const upload = multer({ storage });


async function optimizeAndPrepare(req, res, next) {
  if (!req.file || !req.file.buffer) return next();

  let buffer = req.file.buffer;

  if (req.file.mimetype.startsWith('image/')) {
    try {
      buffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error processing image',
      });
    }
  }

  try {
    const gz = await gzip(buffer);
    buffer = gz;
    req.file.mimetype = 'application/gzip';
    req.file.originalname = `${req.file.originalname}.gz`;
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error compressing file',
    });
  }

  const base64 = buffer.toString('base64');
  req.file.path = `data:${req.file.mimetype};base64,${base64}`;
  req.file.buffer = buffer;
  req.file.size = buffer.length;

  next();
}

module.exports = { upload, optimizeAndPrepare };
