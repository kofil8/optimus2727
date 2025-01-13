import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join( "/var/www/uploads"));
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


const uploadMultipleMedia = upload.fields([
  { name: 'images', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]);

export const fileUploader = {
  upload,
  uploadMultipleMedia,

};
