module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/popcorn_scrum',
    dialect: 'postgres'
  },
  test: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/popcorn_scrum_test',
    dialect: 'postgres'
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 