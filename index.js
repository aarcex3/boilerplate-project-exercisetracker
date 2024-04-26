const express = require('express')
const crypto = require('crypto');
const app = express()
const cors = require('cors');
const { log, count } = require('console');
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))


function generateHashId(username) {
  const hashId = crypto.createHash('md5');
  hashId.update(Buffer.from(username));
  return hashId.digest('hex').substring(0,8);
}


// Tables
const users = {}
const logs = {}



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users',(req,res)=>{
  let arrayOfUsers = []
  for (var id in users) {
      arrayOfUsers.push({username:users[id],_id:id})
    }
    res.json(arrayOfUsers)
});

app.post('/api/users',(req,res)=>{
  const { username } = req.body;
  if (!username){
    res.status(400).json({ error: 'Username is required' });
  } 
  const _id = generateHashId(username)
  users[_id] = username
  res.json({
    username:username,
    _id:_id
  })
});

app.post('/api/users/:_id/exercises',(req,res)=>{
   const { _id, description, duration} = req.body;
   if (!_id || !description || !duration) {
    return res.status(400).json({ error: "Please provide _id, description, and duration." });
  }
   let { date } = req.body;
   date = !date ? new Date().toDateString() : new Date().toDateString(date);
   const exercise = {
    username:users[_id], 
    description:description,
    duration:duration,
    date: date,
    _id: _id
  }
  if(logs[_id]){
    logs[_id].push(exercise)
  } else {
    logs[_id] = [exercise]
  }
  res.json(exercise);
})

app.get('/api/users/:_id/logs',(req,res)=>{
    const {_id} = req.params;
    console.log(req.params)
    res.json({
      username:users[_id],
      count: logs[_id].length,
      _id: _id,
      log: logs[_id]
    })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
