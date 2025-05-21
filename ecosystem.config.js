module.exports = {
    apps: [{
        name: 'todo-service',
        script: './src/index.js',
        instances: 'max',      // 1 par cœur CPU
        exec_mode: 'cluster',
        watch: false,
        env: { NODE_ENV: 'production' },
    }],
};
