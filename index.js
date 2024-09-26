const dotenv = require('dotenv');
const express = require('express');

dotenv.config({ path: './.env' });

const app = express();

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  next();
});

app.get('/', (req, res) => {
  res.send('Express is work');
});

app.get('/sva', async (_req, res) => {
  const api = process.env.URL_SVA;
  const user = process.env.USER;
  const password = process.env.PASSWORD;

  const token = 'Basic ' + btoa(user + ':' + password);

  try {
    const response = await fetch(api, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    const result = await response.json();
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 3456;

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
