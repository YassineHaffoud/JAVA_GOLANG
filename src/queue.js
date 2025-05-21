const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis();

const myQueue = new Queue('my-queue', { connection });

module.exports = {
    Queue,
    IORedis,
    myQueue,
};
