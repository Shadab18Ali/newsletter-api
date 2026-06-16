const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host:     process.env.MYSQLHOST,
  port:     parseInt(process.env.MYSQLPORT),
  user:     process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
});

app.post('/subscribe', async (req, res) => {
  try {
    const { fullName, email, mobile, pageURL, submittedAt } = req.body;

    if (!fullName || !email || !mobile) {
      return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    await db.execute(
      'INSERT INTO newsletter_subscribers (full_name, email, mobile, page_url, submitted_at) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, mobile, pageURL || '', submittedAt || new Date()]
    );

    res.json({ status: 'ok' });

  } catch (err) {
    console.error('MySQL error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'alive' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on port ' + PORT));
