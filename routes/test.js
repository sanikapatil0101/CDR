// routes/test.js
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readData, writeData } = require('../data/storage');
const questions = require('../data/questions.json');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// public: get questions (caretaker UI will display these)
router.get('/questions', (req, res) => {
  res.json({ questions });
});

// start a test (creates a test record)
router.post('/start', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const data = await readData();
  const test = {
    id: uuidv4(),
    userId,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    answers: [],
    score: null
  };
  data.tests.push(test);
  await writeData(data);
  res.json({ testId: test.id, startedAt: test.startedAt });
});

// submit answers for a test
// expected body: { testId: "...", answers: [ { qId: "q1", rating: 2 }, ... ] }
router.post('/submit', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { testId, answers } = req.body || {};
  if (!testId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'testId and answers array required' });
  }

  const data = await readData();
  const test = data.tests.find(t => t.id === testId && t.userId === userId);
  if (!test) return res.status(404).json({ error: 'Test not found' });
  if (test.finishedAt) return res.status(400).json({ error: 'Test already submitted' });

  // store answers
  test.answers = answers.map(a => ({ qId: a.qId, rating: Number(a.rating) }));
  test.finishedAt = new Date().toISOString();

  // basic scoring: sum of ratings (customize to your scoring rules)
  const score = test.answers.reduce((acc, a) => acc + (Number(a.rating) || 0), 0);
  test.score = score;

  await writeData(data);
  res.json({ testId: test.id, finishedAt: test.finishedAt, score });
});

// get test results
router.get('/results/:testId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const testId = req.params.testId;
  const data = await readData();
  const test = data.tests.find(t => t.id === testId && t.userId === userId);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  res.json({ test });
});

// list user's tests
router.get('/my-tests', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const data = await readData();
  const tests = data.tests.filter(t => t.userId === userId);
  res.json({ tests });
});

module.exports = router;
