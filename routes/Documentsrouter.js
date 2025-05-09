var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const {uploadDocument, getAllDocuments, deleteDocument}=require("../controllers/DocumentsController")
const {upload, optimizeAndPrepare }=require("../middlewares/uplod")


router.post("/upload", verifyToken, upload.single("file"), optimizeAndPrepare , uploadDocument);
router.get("/", verifyToken, getAllDocuments);
router.delete("/delete", verifyToken, deleteDocument);

module.exports = router;
