import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { BackupController } from '../controllers/backup.controller';

const router = Router();

router.use(authenticate);

router.get('/export', BackupController.exportData);
router.post('/import', BackupController.importData);

export default router;
