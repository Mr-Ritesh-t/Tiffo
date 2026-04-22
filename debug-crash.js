import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    console.log('Navigating to http://localhost:5174/mess/1 ...');
    await page.goto('http://localhost:5174/mess/1', { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully. Waiting 3 seconds for React to mount and throw...');
    await new Promise(r => setTimeout(r, 3000));
    
    const content = await page.$eval('#root', el => el.innerHTML);
    if (!content || content.trim() === '') {
      console.log('CRASH CONFIRMED: #root div is empty!');
    } else {
      console.log('NO CRASH: #root has content.');
    }
  } catch (err) {
    console.error('PUPPETEER LAUNCH ERROR:', err);
  } finally {
    await browser.close();
  }
})();
