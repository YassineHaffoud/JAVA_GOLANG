const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Ajv = require('ajv');
const { initTelemetry } = require('./telemetry');
const todosRouter = require('./routes/todos');
const { logger } = require('./logger');

// Initialize OpenTelemetry
initTelemetry();

const app = express();
app.use(express.json());
app.use(compression());

// Rate limiting
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Health check
app.get('/health', (req, res) => res.status(200).send({ status: 'ok' }));

// API routes
app.use('/todos', todosRouter);

const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        logger.info('http_request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: Date.now() - start,
        });
    });
    next();
});
module.exports = app; // pour les tests
