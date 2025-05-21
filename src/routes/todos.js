// src/routes/todos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/todoController');
const { idempotency } = require('../middleware/idempotency');
const Ajv = require('ajv');
const ajv = new Ajv();

// JSON Schema de validation
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    completed: { type: 'boolean' }
  },
  required: ['title'],
  additionalProperties: false
};
const validate = ajv.compile(schema);

// Middleware de validation pour POST et PUT
function validateMiddleware(req, res, next) {
  const valid = validate(req.body);
  if (!valid) {
    return res.status(400).json({ errors: validate.errors });
  }
  next();
}

// Routes CRUD avec idempotence et validation sur création/mise à jour
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.post(
    '/',
    idempotency,
    validateMiddleware,
    ctrl.createTodo
);

router.put(
    '/:id',
    idempotency,
    validateMiddleware,
    ctrl.updateTodo
);

router.delete('/:id', ctrl.deleteTodo);

module.exports = router;
