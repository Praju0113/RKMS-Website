const pool = require('../database/mysql');

const parseDonationSuggestions = (value) => {
  if (!value) return [500, 1000, 2500, 5000, 10000];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return [500, 1000, 2500, 5000, 10000];
  }
};

const ensureSettingsColumns = async () => {
  const [columns] = await pool.query('SHOW COLUMNS FROM settings');
  const existing = new Set(columns.map((c) => c.Field));

  const addColumnIfMissing = async (columnName, definition) => {
    if (existing.has(columnName)) return;
    await pool.query(`ALTER TABLE settings ADD COLUMN ${columnName} ${definition}`);
    existing.add(columnName);
  };

  await addColumnIfMissing('membership_fee', 'DECIMAL(10,2) DEFAULT 1001');
  await addColumnIfMissing('donation_suggestions', 'JSON');
  await addColumnIfMissing('contact_email', 'VARCHAR(100)');
  await addColumnIfMissing('organization_name', 'VARCHAR(200)');
  await addColumnIfMissing('default_event_price', 'DECIMAL(10,2) DEFAULT 0');
  await addColumnIfMissing('razorpay_secret', 'VARCHAR(150)');
  await addColumnIfMissing('jwt_secret', 'VARCHAR(200)');
};

const getSettings = async () => {
  await ensureSettingsColumns();

  await pool.query(`
    UPDATE settings
    SET razorpay_secret = COALESCE(razorpay_secret, razorpay_key_secret)
    WHERE (razorpay_secret IS NULL OR razorpay_secret = '')
      AND razorpay_key_secret IS NOT NULL
  `);

  const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1 LIMIT 1');

  if (!rows.length) {
    await pool.query(
      `INSERT INTO settings (id, membership_fee, donation_suggestions, contact_email, organization_name, default_event_price)
       VALUES (1, 1001, ?, 'info@rksmahilavedike.org', 'Raju Kshatriya Mahila Sangha', 0)`,
      [JSON.stringify([500, 1000, 2500, 5000, 10000])]
    );
    return getSettings();
  }

  const row = rows[0];
  return {
    id: row.id,
    membershipFee: Number(row.membership_fee || 1001),
    donationSuggestions: parseDonationSuggestions(row.donation_suggestions),
    contactEmail: row.contact_email || '',
    organizationName: row.organization_name || '',
    defaultEventPrice: Number(row.default_event_price || 0),
    razorpayKeyId: row.razorpay_key_id || '',
    razorpaySecret: row.razorpay_secret || '',
    emailUser: row.email_user || '',
    emailPass: row.email_pass || '',
    jwtSecret: row.jwt_secret || ''
  };
};

const updateSettings = async (updates) => {
  const fieldMap = {
    membershipFee: 'membership_fee',
    donationSuggestions: 'donation_suggestions',
    contactEmail: 'contact_email',
    organizationName: 'organization_name',
    defaultEventPrice: 'default_event_price',
    razorpayKeyId: 'razorpay_key_id',
    razorpaySecret: 'razorpay_secret',
    emailUser: 'email_user',
    emailPass: 'email_pass',
    jwtSecret: 'jwt_secret'
  };

  const keys = Object.keys(updates).filter((key) => fieldMap[key]);
  if (!keys.length) return getSettings();

  const setClause = keys.map((key) => `${fieldMap[key]} = ?`).join(', ');
  const values = keys.map((key) => {
    if (key === 'donationSuggestions') return JSON.stringify(updates[key]);
    return updates[key];
  });

  await pool.query(`UPDATE settings SET ${setClause} WHERE id = 1`, values);
  return getSettings();
};

module.exports = {
  getSettings,
  updateSettings
};
