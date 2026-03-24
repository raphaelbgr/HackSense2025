import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Go to home
  await page.goto('http://localhost:4111');
  await page.waitForTimeout(1000);

  // Click start game
  await page.click('text=Começar Jogo');
  await page.waitForTimeout(2000);

  // Click on first image
  await page.click('.image-card img', { position: { x: 10, y: 10 } });
  await page.waitForTimeout(500);

  // Take screenshot with feedback
  await page.screenshot({ path: 'screenshots/test-feedback.png', fullPage: true });

  console.log('Feedback screenshot saved');

  await browser.close();
})();
