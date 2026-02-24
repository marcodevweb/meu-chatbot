const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const https = require('https');

// 1. SERVIDOR PARA O RENDER
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot está monitorando!'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

// 2. SISTEMA ANTI-SONO (KEEP-ALIVE)
// Substitua URL_DO_SEU_APP pela sua URL real do Render
const RENDER_URL = 'https://meu-chatbot-sovy.onrender.com'; 
setInterval(() => {
    https.get(RENDER_URL, (res) => console.log(`[Keep-Alive] Status: ${res.statusCode}`));
}, 5 * 60 * 1000); // Ping a cada 5 minutos

// 3. CONFIGURAÇÃO DO BOT (SUPER LITE)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote',
            '--no-first-run',
            '--js-flags="--max-old-space-size=256"' // Limita memória para o Render grátis
        ],
    }
});

// Verificação de progresso
client.on('loading_screen', (percent, message) => console.log(`[Sincronizando] ${percent}% - ${message}`));

client.on('qr', (qr) => {
    console.log('--- SCANEE O QR CODE ABAIXO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('!!! BOT ONLINE E PRONTO !!!');
});

// 4. LÓGICA DE VENDAS
const videoUrl = 'https://res.cloudinary.com/dm1tbo0ru/video/upload/v1/Algum_gostoso_por_SP__k3yni0.mp4';
const mensagemBoasVindas = `Bem-vindo ao VIP da Anna🔥\n\n✨ Vídeos +18 completos\n✨ Lives exclusivas\n✨ Interação com os assinantes\n\nResponda com "EU QUERO!"`;

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const text = msg.body.toLowerCase().trim();
        const sender = msg.from;

        if (chat.isGroup || sender === 'status@broadcast') return;

        console.log(`[Mensagem] De ${sender}: ${text}`);

        // Gatilho inicial
        if (text.includes('oii anna') || text.includes('conteúdos sem censura')) {
            const media = await MessageMedia.fromUrl(videoUrl);
            await client.sendMessage(sender, media);
            await client.sendMessage(sender, mensagemBoasVindas);
        }

        // Menu de Planos
        else if (text.includes('eu quero') || text.includes('quero assinar')) {
            const menu = `💎 *MEUS PLANOS EXCLUSIVOS* 💎\n\n1️⃣ *R$19,90 - EXIBIÇÃO🔥*\n2️⃣ *R$49,90 - COMPLETO+MENAGE🔞*\n\n👉 *Digite apenas o número (1 ou 2)*`;
            await client.sendMessage(sender, menu);
        }

        // Envio do PIX
        else if (text === '1' || text === '2') {
            const valor = text === '1' ? '19,90' : '49,90';
            const chavePix = "manusoares1442@gmail.com";
            await client.sendMessage(sender, `✅ *PEDIDO GERADO*\n*Valor:* R$ ${valor}\n\nChave PIX (E-mail):`);
            await client.sendMessage(sender, chavePix);
            await client.sendMessage(sender, `\n⚠️ Envie o comprovante aqui para liberar o acesso!`);
        }

        // Recebimento de Comprovante
        else if (msg.hasMedia && (msg.type === 'image' || msg.type === 'document')) {
            const link = "https://drive.google.com/drive/folders/1cHdlEY_z74IFBwfm47Vjzesuo1RKE7JT?usp=sharing";
            await client.sendMessage(sender, `Aqui está seu acesso amor: ${link}`);
        }
    } catch (e) {
        console.error('[Erro] ', e.message);
    }
});

console.log('Iniciando o sistema...');
client.initialize();
