import { router } from './routes.js';
import { PlaywrightCrawler } from 'crawlee';
import { exportDatasetToFile } from './utils.js';

const startUrl = 'https://ewyszukiwarka.pue.uprp.gov.pl/search/advanced-search';
// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error('Usage: npm start <startDate> <endDate>');
    console.error('Example: npm start 2024-01-01 2024-03-20');
    process.exit(1);
}

const [startDate, endDate] = args;

// Validate date format (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    console.error('Invalid date format. Please use YYYY-MM-DD format.');
    process.exit(1);
}


const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 60,
    requestHandler: router,
    maxRequestRetries: 3,
    headless: false
});

await crawler.run([
    {
        url: startUrl,
        label: 'SEARCH',
        userData: {
            startDate,
            endDate,
        },
    },
]);
await exportDatasetToFile('output.json');
