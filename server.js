// server.js
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const testRouter = require('./routes/test');
const { ensureStorage } = require('./data/storage');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ensure data file exists and basic structure
ensureStorage();

app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Alzheimer CDR backend running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
