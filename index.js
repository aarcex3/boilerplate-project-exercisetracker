const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

function generateHashId(username) {
  const hashId = crypto.createHash('md5');
  hashId.update(Buffer.from(username));
  return hashId.digest('hex').substring(0, 8);
}

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', (req, res) => {
  const arrayOfUsers = Object.keys(users).map(id => ({
    username: users[id].username,
    _id: id
  }));
  res.status(200).json(arrayOfUsers);
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const _id = generateHashId(username);
  const user = {
    username,
    count: 0,
    _id,
    log: []
  };
  
  users[_id] = user;

  res.status(200).json({
    username,
    _id
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, date } = req.body;
  let { duration } = req.body;
  if (!_id || !description || !duration) {
    return res.status(400).json({ error: "Please provide _id, description, and duration." });
  }
  const parsedDate = Number(duration)
  const exercise = {
    description,
    duration:parsedDate,
    date: date || new Date().toDateString()
  };
  
  users[_id].log.push(exercise);
  users[_id].count++;
  
  res.json({
    _id,
    username: users[_id].username,
    description,
    parsedDate,
    date: exercise.date
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  res.status(200).json(users[_id]);
});

const PORT = process.env.PORT || 3000;
const listener = app.listen(PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
