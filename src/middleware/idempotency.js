// src/middleware/idempotency.js
const { redis } = require('../redis');

async function idempotency(req, res, next) {
    const key = req.header('Idempotency-Key');
    if (!key) return next();
    const cached = await redis.get(key);
    if (cached) {
        const { status, body } = JSON.parse(cached);
        return res.status(status).json(body);
    }
    // Hijack send to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        redis.set(key, JSON.stringify({ status: res.statusCode, body }), 'EX', 24 * 3600);
        return originalJson(body);
    };
    next();
}

module.exports = { idempotency };
