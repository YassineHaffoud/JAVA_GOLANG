const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/todoController');
const Ajv = require('ajv');
const ajv = new Ajv();

// Schéma de validation
const schema = {
  type: 'object',
  properties: { title: { type: 'string' }, completed: { type: 'boolean' } },
  required: ['title'],
  additionalProperties: false
};
const validate = ajv.compile(schema);

// Middleware validation
router.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const valid = validate(req.body);
    if (!valid) return res.status(400).json({ error: validate.errors });
  }
  next();
});

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.createTodo);
router.put('/:id', ctrl.updateTodo);
router.delete('/:id', ctrl.deleteTodo);

module.exports = router;