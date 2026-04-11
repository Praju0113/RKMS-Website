const pool = require('../database/mysql');

const generateMembershipId = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `RKS${currentYear}`;
    const likePrefix = `${prefix}-%`;

    const [rows] = await pool.query(
      `SELECT membership_id
       FROM members
       WHERE membership_id LIKE ?
       ORDER BY membership_id DESC
       LIMIT 1`,
      [likePrefix]
    );

    let sequenceNumber = 1;
    if (rows.length && rows[0].membership_id) {
      const parts = rows[0].membership_id.split('-');
      if (parts.length > 1) {
        sequenceNumber = parseInt(parts[1], 10) + 1;
      }
    }

    const formattedSequence = sequenceNumber.toString().padStart(4, '0');
    return `${prefix}-${formattedSequence}`;
  } catch (error) {
    console.error('Error generating membership ID:', error);
    throw error;
  }
};

module.exports = { generateMembershipId };
