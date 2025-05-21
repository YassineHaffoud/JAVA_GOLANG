// src/controllers/todoController.js
const model = require('../models/todo');
const { enqueueTodo } = require('../queue');

/**
 * Liste tous les todos depuis la DB
 */
async function list(req, res) {
  const todos = await model.getAll();
  return res.json(todos);
}

/**
 * Récupère un todo par son ID
 */
async function get(req, res) {
  const id = parseInt(req.params.id, 10);
  const todo = await model.getById(id);
  if (!todo) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json(todo);
}

/**
 * Crée un nouveau todo et enfile un job asynchrone
 */
async function createTodo(req, res) {
  // Création en base
  const todo = await model.create(req.body);
  // Enqueue du job (traité par worker séparé)
  try {
    await enqueueTodo(todo);
  } catch (err) {
    console.error('Enqueue Todo failed:', err);
  }
  return res.status(201).json(todo);
}

/**
 * Met à jour un todo existant
 */
async function updateTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  const updated = await model.update(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.json(updated);
}

/**
 * Supprime un todo par son ID
 */
async function deleteTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  await model.remove(id);
  return res.status(204).send();
}

module.exports = {
  list,
  get,
  createTodo,
  updateTodo,
  deleteTodo,
};
