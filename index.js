const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot está online e monitorando!');
});

app.listen(port, () => {
    console.log(`Servidor de monitoramento rodando na porta ${port}`);
});

// --- SISTEMA ANTI-HIBERNAÇÃO (KEEP-ALIVE) ---
const RENDER_URL = 'https://meu-chatbot-sovy.onrender.com';
setInterval(() => {
    https.get(RENDER_URL, (res) => {
        console.log(`[Keep-Alive] Ping realizado. Status: ${res.statusCode}`);
    }).on('error', (err) => {
        console.log('[Keep-Alive] Erro: ' + err.message);
    });
}, 5 * 60 * 1000);

console.log('--- Configurando Cliente WhatsApp ---');

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014581023-alpha.html',
    },
    puppeteer: {
        headless: true,
        executablePath: process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--disable-setuid-sandbox',
            '--no-sandbox',
        ],
    }
});

client.on('qr', (qr) => {
    console.log('--- NOVO QR CODE GERADO ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('!!! BOT ESTÁ ONLINE E PRONTO PARA RESPONDER !!!');
});

client.on('authenticated', () => {
    console.log('Autenticado com sucesso!');
});

client.on('auth_failure', msg => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Bot foi desconectado:', reason);
});

// Mensagens e Configurações
const videoUrl = 'https://res.cloudinary.com/dm1tbo0ru/video/upload/v1/Algum_gostoso_por_SP__k3yni0.mp4';
const mensagemBoasVindas = `Bem-vindo ao VIP da Anna🔥

✨ Vídeos +18 completos
✨ Lives exclusivas
✨ Interação com os assinantes

Responda com "EU QUERO!"`;

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const text = msg.body.toLowerCase().trim();
        const sender = msg.from;

        console.log(`[Log] Mensagem de ${sender}: "${text}"`);

        if (chat.isGroup || sender === 'status@broadcast') return;

        if (text.includes('oii anna') || text.includes('conteúdos sem censura')) {
            console.log(`[Ação] Enviando boas-vindas para ${sender}`);
            const media = await MessageMedia.fromUrl(videoUrl);
            await client.sendMessage(sender, media);
            await client.sendMessage(sender, mensagemBoasVindas);
        }

        else if (text.includes('eu quero') || text.includes('quero assinar')) {
            console.log(`[Ação] Enviando menu para ${sender}`);
            const menuPlanos = `💎 *MEUS PLANOS EXCLUSIVOS* 💎
1️⃣ *R$19,90 - EXIBIÇÃO🔥*
2️⃣ *R$49,90 - COMPLETO+MENAGE🔞*
👉 *Digite apenas o número (1 ou 2)*`;
            await client.sendMessage(sender, menuPlanos);
        }

        else if (text === '1' || text === '2') {
            const valor = text === '1' ? '19,90' : '49,90';
            const chavePix = "manusoares1442@gmail.com";
            console.log(`[Ação] Enviando PIX para ${sender}`);
            await client.sendMessage(sender, `✅ *PEDIDO GERADO*\n*Valor:* R$ ${valor}\n\nChave PIX (E-mail):`);
            await client.sendMessage(sender, chavePix);
            await client.sendMessage(sender, `\n⚠️ Envie o comprovante aqui para liberar o acesso!`);
        }

        else if (msg.hasMedia && (msg.type === 'image' || msg.type === 'document')) {
            console.log(`[Ação] Comprovante recebido de ${sender}`);
            const link = "https://drive.google.com/drive/folders/1cHdlEY_z74IFBwfm47Vjzesuo1RKE7JT?usp=sharing";
            await client.sendMessage(sender, `Aqui está seu acesso amor: ${link}`);
        }
    } catch (e) {
        console.error('Erro ao processar mensagem:', e);
    }
});

console.log('Inicializando...');
client.initialize().catch(err => {
    console.error('Erro catastrófico no initialize:', err);
    // Tenta reiniciar após 10 segundos se falhar
    setTimeout(() => client.initialize(), 10000);
});

