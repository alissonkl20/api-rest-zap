const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, DisconnectReason } = require('@adiwajshing/baileys');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuração do Baileys
const startSock = () => {
    const sock = makeWASocket();

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startSock();
            }
        }
    });

    sock.ev.on('messages.upsert', (message) => {
        console.log('Mensagem recebida:', message);
        io.emit('message', message);
    });

    return sock;
};

const sock = startSock();

// Configuração do Socket.IO
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('send-message', (msg) => {
        console.log('Mensagem enviada:', msg);
        // Enviar mensagem usando Baileys
        sock.sendMessage(msg.to, { text: msg.text });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
    });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});