const db = require('../db');

function getAll() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, title, completed FROM todos', (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(r => ({
        id: r.id,
        title: r.title,
        completed: Boolean(r.completed)
      })));
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, title, completed FROM todos WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve(null);
      else resolve({
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed)
      });
    });
  });
}

function create(data) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todos(title, completed) VALUES(?, 0)',
      [data.title],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, title: data.title, completed: false });
      }
    );
  });
}

function update(id, data) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE todos SET title = COALESCE(?, title), completed = COALESCE(?, completed) WHERE id = ?',
      [data.title, data.completed ? 1 : 0, id],
      function(err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);
        getById(id).then(resolve).catch(reject);
      }
    );
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { getAll, getById, create, update, remove };