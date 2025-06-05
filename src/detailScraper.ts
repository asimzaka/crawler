import { PlaywrightCrawlingContext, Dataset } from 'crawlee';

export async function detailPageHandler( context: PlaywrightCrawlingContext ) {
    const { page, request, log } = context;
    log.info(`Processing detail page: ${request.url}`);

    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    const scrapeDetailPage = async () => {
        const detailData = await page.evaluate(() => {
            const allTitleCells = Array.from(document.querySelectorAll('table.details-list td.detail-title'));

            const targetPwpMap: Record<string, string> = {
                "33": "applicationNumber",
                "39": "registrationNumber",
                "170": "name",
                "195": "status",
                "156": "applicationDate",
                "152": "revelationDate",
                "161": "categoryOfRights",
                "190": "trademarkType"
            };

            const extracted: Record<string, string> = {};

            for (const titleCell of allTitleCells) {
                const pwp = titleCell.getAttribute('data-pwp');
                const fieldKey = pwp ? targetPwpMap[pwp] : null;
                if (!fieldKey) continue;

                const valueCell = titleCell.nextElementSibling as HTMLElement;
                if (!valueCell) continue;

                const value =
                    valueCell.querySelector('span.highlight')?.textContent?.trim() ||
                    valueCell.textContent?.trim() ||
                    '';

                extracted[fieldKey] = value;
            }
            return extracted;
        });

        const data = {
            url: request.url,
            ...detailData
        };

        return data;
    };

    const detailData: any = await scrapeDetailPage();
    log.info(`Scraped data for ${detailData.name} from ${request.url}`);
    await Dataset.pushData(detailData)
}

