const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot está online!');
});

app.listen(port, () => {
    console.log(`Servidor de monitoramento rodando na porta ${port}`);
});

// --- SISTEMA ANTI-HIBERNAÇÃO (KEEP-ALIVE) ---
// Isso faz o bot "se chamar" a cada 10 minutos para não deixar o Render desligar
const https = require('https');
const RENDER_URL = 'https://meu-chatbot-sovy.onrender.com'; // Sua URL do Render

setInterval(() => {
    https.get(RENDER_URL, (res) => {
        console.log(`Ping de auto-atendimento (Status: ${res.statusCode}) - Mantendo o bot acordado...`);
    }).on('error', (err) => {
        console.log('Erro no ping de auto-atendimento: ' + err.message);
    });
}, 10 * 60 * 1000); // 10 minutos (Render dorme após 15min)
// --------------------------------------------

console.log('Iniciando o bot...');
// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1033861123-alpha.html',
    },
    puppeteer: {
        headless: true,
        executablePath: process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    }
});

// Gera o QR Code no terminal para autenticação
client.on('qr', (qr) => {
    console.log('--- ESCANEIE O QR CODE ABAIXO PARA CONECTAR ---');
    qrcode.generate(qr, { small: true });
});

// Evento quando o bot está pronto
client.on('ready', () => {
    console.log('Bot de vendas está online e pronto!');
});

// Mensagem solicitada
const mensagemBoasVindas = `Bem-vindo ao VIP da Anna🔥

✨ Vídeos +18 completos
✨ Lives exclusivas
✨ Interação com os assinantes

Responda com "EU QUERO!"`;

// URL direta do vídeo (MP4) para download e envio
const videoUrl = 'https://res.cloudinary.com/dm1tbo0ru/video/upload/v1/Algum_gostoso_por_SP__k3yni0.mp4';

// Lógica de Mensagens
client.on('message', async msg => {
    const chat = await msg.getChat();
    const text = msg.body.toLowerCase().trim();

    console.log(`Mensagem recebida de ${msg.from}: "${text}"`);

    // Responder apenas se for chat individual e não for status
    if (chat.isGroup || msg.from === 'status@broadcast') return;

    // Gatilho específico para ativação solicitado
    const gatilhoAtivacao = "oii anna, quero ter acesso aos seus conteúdos sem censura";

    if (text === gatilhoAtivacao) {
        try {
            console.log('Ativação detectada! Preparando envio...');

            console.log('Carregando vídeo...');
            const media = await MessageMedia.fromUrl(videoUrl);

            console.log('Enviando vídeo primeiro...');
            await client.sendMessage(msg.from, media);

            console.log('Enviando mensagem de texto...');
            await client.sendMessage(msg.from, mensagemBoasVindas);
            console.log('Bot ativado com sucesso para este usuário!');
        } catch (err) {
            console.error('Erro ao enviar mídia:', err);
            await client.sendMessage(msg.from, mensagemBoasVindas);
            await client.sendMessage(msg.from, 'Ops, tive um problema ao carregar o vídeo. Veja aqui: ' + videoUrl);
        }
    }

    else if (text.includes('eu quero') || text.includes('quero assinar')) {
        console.log('Interesse detectado! Enviando menu de planos...');

        const menuPlanos = `💎 *MEUS PLANOS EXCLUSIVOS* 💎

Escolha uma das opções abaixo para liberar seu acesso imediatamente:

1️⃣ *R$19,90 - EXIBIÇÃO🔥*
_Conteúdo me exibindo e gozando bem gostoso_

2️⃣ *R$49,90 - COMPLETO+MENAGE🔞*
_Conteúdo dando a minha bucetinha e menage com minhas amiguinhas_

------------------------------------------
👉 *Para escolher, digite apenas o número (1 ou 2)*`;

        await client.sendMessage(msg.from, menuPlanos);
        console.log('Menu de planos enviado com sucesso!');
    }

    else if (text === '1' || text === '2' || text.includes('19,90') || text.includes('49,90')) {
        const ePlano1 = text === '1' || text.includes('19,90');
        const planoEscolhido = ePlano1 ? 'R$19,90 - EXIBIÇÃO' : 'R$49,90 - COMPLETO';
        const valorPix = ePlano1 ? '19.90' : '49.90';
        const chavePix = "manusoares1442@gmail.com";

        console.log(`Plano ${planoEscolhido} selecionado. Enviando PIX para ${chavePix}...`);

        // Mensagem de confirmação estilo comercial
        await client.sendMessage(msg.from, `✅ *CONFIRMAÇÃO DE PEDIDO*\n\n*Item:* ${planoEscolhido}\n*Valor:* R$ ${valorPix.replace('.', ',')}\n*Status:* Aguardando Pagamento`);

        // Mensagem informativa e Chave PIX isolada para cópia fácil
        await client.sendMessage(msg.from, `Pague usando a chave PIX (E-mail) abaixo:`);

        // Envia a chave isolada para facilitar o copiar e colar, simulando o comportamento do Business
        await client.sendMessage(msg.from, chavePix);

        await client.sendMessage(msg.from, `\n⚠️ *AVISO:* Após realizar o pagamento, envie o comprovante aqui para que eu possa liberar seu acesso VIP imediatamente! 🔥`);
        console.log('Fluxo de pagamento enviado com chave real!');
    }

    // Detectar envio de comprovante (Foto ou Documento/PDF)
    else if (msg.hasMedia && (msg.type === 'image' || msg.type === 'document')) {
        console.log(`Comprovante recebido de ${msg.from}. Enviando conteúdo...`);
        const linkConteudo = "https://drive.google.com/drive/folders/1cHdlEY_z74IFBwfm47Vjzesuo1RKE7JT?usp=sharing";
        await client.sendMessage(msg.from, `aqui está o seu conteudo amor : ${linkConteudo}`);
    }
});

console.log('Inicializando o cliente...');
client.initialize().then(() => console.log('Initialize chamado com sucesso')).catch(err => console.error('Erro no initialize:', err));
