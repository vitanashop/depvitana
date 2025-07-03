import express from 'express';
const app = express();

app.get(['/saude', '/health'], (req, res) => {
  res.status(200).send('ok');
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
