const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true
        });
        console.log('Chrome opened successfully!');
        await browser.close();
    } catch (err) {
        console.error('Error opening Chrome:', err);
    }
})();
