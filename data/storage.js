// data/storage.js
const fs = require('fs').promises;
const path = require('path');

const FILE = path.join(__dirname, 'data.json');

async function ensureStorage() {
  try {
    await fs.access(FILE);
  } catch (err) {
    const init = {
      users: [],        // { id, name, email, passwordHash }
      tests: [],        // { id, userId, startedAt, finishedAt, answers: [{qId, rating}], score }
      nextTestId: 1
    };
    await fs.writeFile(FILE, JSON.stringify(init, null, 2));
  }
}

async function readData() {
  const raw = await fs.readFile(FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  ensureStorage,
  readData,
  writeData,
  FILE
};
