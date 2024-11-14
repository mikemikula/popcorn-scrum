export default {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    database: {
        url: process.env.DATABASE_URL || 'postgres://localhost:5432/popcorn_scrum',
    },
    env: process.env.NODE_ENV || 'development'
}; 