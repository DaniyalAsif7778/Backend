import express from 'express';

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('hellow dearn server is listening');
});

app.listen(PORT, (req, res) => {
  console.log('app is listing at the 3000');
});
