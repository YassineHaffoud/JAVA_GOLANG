// src/worker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');

// Connexion à Redis
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// Worker sur la queue "todoQueue"
const worker = new Worker(
    'todoQueue',
    async (job) => {
        // job.data = { id, title }
        logger.info(`Processing job ${job.id} – création tâche #${job.data.id}`);
        // Ici : envoi de mail, logs, notification, etc.
    },
    { connection }
);

// Événements de complétion et d'erreur
tooltip
worker.on('completed', (job) => logger.info(`Job ${job.id} done.`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));
