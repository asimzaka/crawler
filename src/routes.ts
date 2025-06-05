import { createPlaywrightRouter, PlaywrightCrawlingContext } from 'crawlee';
import { searchPageHandler } from './searchCrawler.js';
import { detailPageHandler } from './detailScraper.js';

export const router = createPlaywrightRouter();

router.addHandler('SEARCH', async (context: PlaywrightCrawlingContext) => {
    await searchPageHandler(context);
});

router.addHandler('DETAIL', async (context: PlaywrightCrawlingContext) => {
    await detailPageHandler(context);
});
