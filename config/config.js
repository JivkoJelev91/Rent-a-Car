module.exports = {
    development: {
        port: process.env.PORT || 4321,
        dbPath: 'mongodb://localhost:27017/unidb'
    },
    production: {}
};