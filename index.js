const express = require('express');
const db = require('./db');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
// need jwt for different user pages
// const jwt = require('jsonwebtoken');
// if needed to return username etc,, need to save
// expire time ~ up to 30min, need to refresh 
// (relogin, refresh token - generate new access token)
// regresh token expires in 30 days with no activity
// RESEARCH!!!
//

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

//postman
//https://medium.com/@anshmunjal/how-to-create-get-and-post-endpoints-in-nodejs-using-expressjs-77fd3953ec38
// db connection: https://medium.com/@eslmzadpc13/how-to-connect-a-postgres-database-to-express-a-step-by-step-guide-b2fffeb8aeac
// app.get('/', (req, res) => res.send('API is running'));

app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/register', async (req, res) => {
  const { name, password } = req.body;
// userid -> primary key (increment) ?
// registration confirmation: could send user an verification DO THIS FIRST
// code email (code expires in 5 min) (USE EMAIL)
// * need reset password function (forgot ur password, resend email)
// 
  try {
    //check if username exists
    const usernameExist = await db.query('SELECT * FROM users WHERE username = $1', [name]);

    if (usernameExist.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const result = await db.query(
      'INSERT INTO users (username, userpwd) VALUES ($1, $2) RETURNING *',
      [name, password]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error inserting user:', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

app.post('/api/login', cors(), async (req, res) => {
  const { name, password } = req.body;

  try {
    // check all the error code and its messages and implement the error msg in here
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND userpwd = $2',
      [name, password]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in, Internal server error.' });
  }
});

//5432 is db port
// app.listen(5000, () => {
//   console.log(`Server is running on http://localhost:5000`);
// });

app.get('/users-list', (req, res) => {
  // Get complete list of users
  const usersList = [];

  // Send the usersList as a response to the client
  res.send(usersList);
});