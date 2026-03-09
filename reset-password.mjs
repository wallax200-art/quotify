import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

const password = 'W@llax1997';
const email = 'walax200@gmail.com';

// Generate hash
const hash = await bcrypt.hash(password, 10);
console.log('Password hash:', hash);

// Update database
const connection = await mysql.createConnection({
  host: 'gateway04.us-east-1.prod.aws.tidbcloud.com',
  user: '2pUNe727c8yqxdN.root',
  password: 'IsLZXG1984TrSkY1P7ry',
  database: 'ji3XHgPR7e79CMEH66Wkcf',
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  const result = await connection.execute(
    'UPDATE users SET password = ? WHERE email = ?',
    [hash, email]
  );
  console.log('Password updated successfully');
  console.log('Affected rows:', result[0].affectedRows);
} catch (err) {
  console.error('Error updating password:', err.message);
} finally {
  await connection.end();
}
