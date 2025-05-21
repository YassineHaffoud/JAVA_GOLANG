const model = require('../models/todo');

async function list(req, res) {
  const todos = await model.getAll();
  res.json(todos);
}

async function get(req, res) {
  const id = parseInt(req.params.id, 10);
  const todo = await model.getById(id);
  if (!todo) return res.status(404).send({ error: 'Not found' });
  res.json(todo);
}

async function createTodo(req, res) {
  const todo = await model.create(req.body);
  res.status(201).json(todo);
}

async function updateTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  const updated = await model.update(id, req.body);
  if (!updated) return res.status(404).send({ error: 'Not found' });
  res.json(updated);
}

async function deleteTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  await model.remove(id);
  res.status(204).send();
}

module.exports = { list, get, createTodo, updateTodo, deleteTodo };