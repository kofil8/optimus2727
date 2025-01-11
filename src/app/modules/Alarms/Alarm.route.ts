import { Router } from 'express';
import { AlarmController } from './Alarm.controller';
import multer from 'multer';

const router = Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/alarms', upload.single('file'), AlarmController.create);
router.get('/alarms', AlarmController.getAll);
router.get('/alarms/:id', AlarmController.getById);
router.put('/alarms/:id', upload.single('file'), AlarmController.update);
router.delete('/alarms/:id', AlarmController.delete);

export const AlarmRoutes = router;
