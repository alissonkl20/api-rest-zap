import express from 'express';

const app = express();
const PORT = 3000;

// Middleware para parsing de JSON
app.use(express.json());

// Rota inicial
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Bem-vindo à API REST!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});