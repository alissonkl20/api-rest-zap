import express from 'express';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
  res.send('Servidor está rodando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});