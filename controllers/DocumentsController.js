const Document = require('../models/Documents');
const cloudinary = require("../config/cloudinary");


/**
 * @desc   Upload a document
 * @route  POST /api/documents/upload
 * @access  Private
 */
exports.uploadDocument = async (req, res) => {
    try {
        const  userId  = req.user._id;
        const file = req.file.path; 
        

        //upload more files to cloudinary
        const result = await cloudinary.uploader.upload(file, {
            folder: 'documents',
            resource_type: 'auto', 
        });
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const findDocument = await Document.findOne({
            userId: userId,
            data: { $gte: startOfDay, $lte: endOfDay },
        });        if (findDocument) {
            const updatedDocument = await Document.findByIdAndUpdate(
                findDocument._id,
                { $push: { file: result.secure_url } },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                data: updatedDocument,
            });
        }


        const document = await Document.create({
            file: [result.secure_url],
            userId: userId,
        });

        res.status(201).json({
            success: true,
            data: document,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
        });
    }
}
/**
 * @desc   Get all documents
 * @route  GET /api/documents
 * @access  Private
 */
 exports.getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user._id });
        
        res.status(200).json({
            data: documents,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
        });
    }
}

/**
 * @desc   Delete a single file from a document
 * @route  DELETE /api/documents/:id
 * @access Private
 */
exports.deleteDocument = async (req, res) => {
    try {
      const { link } = req.body;        
      const userId  = req.user._id;
  
      const document = await Document.findOne({  userId, file: link });
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found or not yours' });
      }
  
      const urlParts = link.split('/');
      const lastPart = urlParts[urlParts.length - 1];        
        const publicId = `documents/${lastPart.split('.')[0]}`; 
        
        let resourceType = 'raw';  // افتراضي للمستندات
        if (link.match(/\.(jpe?g|png|gif)$/i)) {
          resourceType = 'image';
        } else if (link.match(/\.(mp4|mov|avi)$/i)) {
          resourceType = 'video';
        }
        
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType
        });
        
        if (result.result !== 'ok') {
          return res.status(500).json({ message: 'Failed to delete file from Cloudinary' });
        }
  
      await Document.findByIdAndUpdate(
        document._id,
        { $pull: { file: link } },
        { new: true }
      );
  
      return res.status(200).json({ Document, message: 'File removed successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error });
    }
  };