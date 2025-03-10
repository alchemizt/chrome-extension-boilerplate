const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// 🔒 Replace with your Babepedia credentials
const USERNAME = process.env.BP_USERNAME;
const PASSWORD = process.env.BP_PASSWORD;

// 📌 Set up CSV file
const csvWriter = createCsvWriter({
    path: 'favorites.csv',
    header: [{ id: 'name', title: 'Performer Name' }]
});


(async () => {
    if (!USERNAME || !PASSWORD) {
        console.error("❌ Missing USERNAME or PASSWORD environment variables.");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: false,  // Set to true if you want background execution
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: require('puppeteer').executablePath()
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('🔄 Navigating to Babepedia login page...');
        await page.goto('https://www.babepedia.com/login', { waitUntil: 'domcontentloaded' });

        console.log('🔐 Entering login credentials...');
        await page.type('input[name="username"]', USERNAME, { delay: 100 });
        await page.type('input[name="password"]', PASSWORD, { delay: 100 });
        await page.click('button[type="submit"]');

        // Wait for successful login indication
        await page.waitForSelector('.logout-link, .profile-menu', { timeout: 10000 });
        console.log('✅ Logged in successfully!');

        console.log('📄 Navigating to Favorites page...');
        await page.goto('https://www.babepedia.com/favorites', { waitUntil: 'domcontentloaded' });

        // Extract performer names
        console.log('📌 Extracting favorite performers...');
        const performers = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.babe-list .babe-title a'))
                .map(el => el.textContent.trim());
        });

        console.log(`✅ Found ${performers.length} performers!`);

        // Save to CSV
        if (performers.length > 0) {
            await csvWriter.writeRecords(performers.map(name => ({ name })));
            console.log('📁 Favorites saved to favorites.csv');
        } else {
            console.log('⚠️ No performers found in your favorites list.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        console.log(await page.content());  // Debugging
    } finally {
        await browser.close();
        console.log('🚪 Browser closed.');
    }
})();