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

  // Take screenshot
  await page.screenshot({ path: 'screenshots/test-game.png', fullPage: true });

  console.log('Screenshot saved');

  await browser.close();
})();
