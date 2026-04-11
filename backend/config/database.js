const pool = require('../database/mysql');

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('MySQL connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
