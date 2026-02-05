// filepath: c:\Users\Buffer\Documents\api rest zap\backend\src\whatsapp.ts
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Inicializa o cliente do WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '..', 'auth') // Define o diretório para salvar as credenciais
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Variável de controle para ativar/desativar a automação
let automacaoAtiva = false; // Desativada por padrão

// Gera o QR Code para autenticação, se necessário
client.on('qr', (qr) => {
    console.log('Escaneie o QR Code abaixo para autenticar:');
    qrcode.generate(qr, { small: true });
});

// Loga quando o cliente está pronto
client.on('ready', () => {
    console.log('Cliente do WhatsApp está pronto e conectado!');
});

// Loga quando a sessão é autenticada
client.on('authenticated', () => {
    console.log('Sessão autenticada com sucesso!');
});

// Loga quando a sessão é encerrada
client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

// Define blocos de palavras-chave e respostas
const respostas = [
    {
        keywords: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
        resposta: 'Olá! Como posso ajudá-lo?',
    },
    {
        keywords: [
            'tá em casa', 'está em casa', 'ta fazendo o que', 'o que está fazendo',
            'você está em casa', 'vc tá em casa', 'vc está em casa', 'tá por aí', 
            'tá onde', 'onde você está', 'onde vc tá', 'tá ocupado', 'tá livre'
        ],
        resposta: 'Sim, estou por aqui. Precisa de algo?',
    },
    {
        keywords: [
            'tá aí', 'está aí', 'vc tá aí', 'você está aí', 'tá por aqui', 
            'tá presente', 'vc tá presente', 'você está presente', 'oi tá aí'
        ],
        resposta: 'Estou aqui! Em que posso ajudar?',
    },
    {
        keywords: [
            'ajuda', 'socorro', 'preciso de ajuda', 'me ajuda', 'me socorre', 
            'pode me ajudar', 'vc pode ajudar', 'você pode me ajudar', 'ajuda por favor', 
            'socorro urgente', 'preciso de socorro', 'me dá uma mão', 'me dá uma força'
        ],
        resposta: 'Claro! Me diga como posso ajudar você.',
    },
];

// Responde automaticamente a mensagens de qualquer contato
client.on('message', async (message) => {
    console.log('Evento de mensagem acionado.');
    console.log(`Mensagem recebida: ${message.body}`);
    
    // Verifica se a automação está ativa
    if (!automacaoAtiva) {
        console.log('Automação está desativada. Mensagem ignorada.');
        return;
    }

    // Verifica se a mensagem contém alguma palavra-chave definida
    let respostaEncontrada = null;
    for (const item of respostas) {
        if (item.keywords.some(keyword => message.body.toLowerCase().includes(keyword))) {
            respostaEncontrada = item.resposta;
            break;
        }
    }

    // Se nenhuma palavra-chave for encontrada, não envia mensagem
    if (!respostaEncontrada) {
        console.log('Nenhuma palavra-chave correspondente encontrada. Mensagem ignorada.');
        return;
    }

    // Envia a resposta correspondente
    try {
        await client.sendMessage(message.from, respostaEncontrada);
        console.log(`Mensagem automática enviada para ${message.from}`);
    } catch (error) {
        console.error('Erro ao enviar mensagem automática:', error);
    }
});
client.initialize();
const app = express();
const PORT = Number(process.env.PORT) || 3000; 
const HOST = '127.0.0.1'; 

app.use(express.json());
app.get('/ativar', (req, res) => {
    automacaoAtiva = true;
    console.log('Automação ativada via botão.');
    res.send('<h1>Automação ativada!</h1><a href="/">Voltar</a>');
});

// Rota para desativar a automação
app.get('/desativar', (req, res) => {
    automacaoAtiva = false;
    console.log('Automação desativada via botão.');
    res.send('<h1>Automação desativada!</h1><a href="/">Voltar</a>');
});

// Rota para verificar o estado da automação
app.get('/status', (req, res) => {
    res.json({ automacaoAtiva });
});

// Página inicial com os botões
app.get('/', (req, res) => {
    res.send(`
        <h1 style="text-align: center; font-family: Arial, sans-serif; color: #333;">Controle de Automação</h1>
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
            <button onclick="window.location.href='/ativar'" 
                style="padding: 15px 30px; margin: 10px; font-size: 16px; font-weight: bold; color: white; background-color: #28a745; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Ativar Automação
            </button>
            <button onclick="window.location.href='/desativar'" 
                style="padding: 15px 30px; margin: 10px; font-size: 16px; font-weight: bold; color: white; background-color: #dc3545; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Desativar Automação
            </button>
        </div>
    `);
});

// Inicia o servidor APENAS em localhost
app.listen(PORT, HOST, () => {
    console.log(`Servidor web rodando LOCALMENTE em http://${HOST}:${PORT}`);
    console.log('⚠️ Servidor acessível apenas nesta máquina');
});