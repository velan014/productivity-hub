import { Router } from 'express';
import {
  NoteController,
  createNoteSchema,
  updateNoteSchema,
} from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', NoteController.getNotes);
router.get('/categories', NoteController.getCategories);
router.get('/:id', NoteController.getNoteById);
router.post('/', validateBody(createNoteSchema), NoteController.createNote);
router.put('/:id', validateBody(updateNoteSchema), NoteController.updateNote);
router.patch('/:id/pin', NoteController.togglePin);
router.delete('/:id', NoteController.deleteNote);

export default router;
