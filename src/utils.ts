import { PlaywrightCrawlingContext, Dataset } from 'crawlee';
import fs from 'fs/promises';

export async function exportDatasetToFile(filename = 'output.json') {
    const dataset = await Dataset.open(); // uses default dataset
    const items = await dataset.getData();
    await fs.writeFile(filename, JSON.stringify(items.items, null, 2));
    console.log(`✅ Exported ${items.items.length} items to ${filename}`);
}