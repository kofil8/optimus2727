import { Router } from 'express';
import { AlarmController } from './Alarm.controller';
import multer from 'multer';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

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

router.post('/crate-alarm', auth(Role.ADMIN), upload.single('file'), AlarmController.create);
router.get('/get-alarms', AlarmController.getAll);
router.get('/get-alarm/:id', AlarmController.getById);
router.put('/update-alarm/:id',  auth(Role.ADMIN), upload.single('file'), AlarmController.update);
router.delete('/:id', AlarmController.delete);

export const AlarmRoutes = router;
