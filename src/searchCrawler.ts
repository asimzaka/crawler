import { PlaywrightCrawlingContext } from 'crawlee';


export async function searchPageHandler(context: PlaywrightCrawlingContext) {
    const { page, request, log, enqueueLinks } = context;
    log.info(`Processing search page: ${request.url}`);

    await page.waitForLoadState('load');
    await page.waitForLoadState('networkidle');

    await page.waitForFunction(() => {
        const el = document.querySelector('#search_advanced_polish_characters') as HTMLInputElement | null;
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style && style.visibility !== 'hidden' && style.display !== 'none' && el.offsetParent !== null;
    }, { timeout: 10000 });

    const isChecked = await page.$eval('#search_advanced_polish_characters', (el: HTMLInputElement) => el.checked);

    if (isChecked) {
        await page.click('p-checkbox[binary="true"] .ui-chkbox-box');
    } else {
        log.info('"Include Polish characters" checkbox is already unchecked');
    }

    const disabledLabels = [
        "Inventions",
        "European Patents",
        "Supplementary Protection Certificate",
        "Utility Models",
        "Industrial Designs",
        "Integrated Circuit Topography and Geographical Indications"
    ];

    for (const e of disabledLabels) {
        const checkbox = `p-checkbox[aria-label="${e}"] .ui-chkbox-box`;

        await page.waitForSelector(checkbox, { state: 'visible', timeout: 10000 });

        await page.click(checkbox);
    }
    const iconSelectorCollection = 'a[role="button"]:has-text("Collections - Disable all") i.action.icon-color.flaticon-close';
    try {
        await page.waitForSelector(iconSelectorCollection, { state: 'visible', timeout: 10000 });
        await page.click(iconSelectorCollection);
        log.info('Clicked the "Collections - Disable all" icon');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warning(`Error clicking the "Collections - Disable all" icon: ${message}`);
    }

    const deselectIdSpec = 'p-checkbox[aria-label="Industrial design specifications"] .ui-chkbox-box';

    await page.waitForSelector(deselectIdSpec, { state: 'visible', timeout: 10000 });

    await page.click(deselectIdSpec);

    const { startDate, endDate } = request.userData;
    const dateStart = new Date(startDate);
    const dateEnd = new Date(endDate);
    const formattedStartDate = dateStart.toISOString().split('T')[0];
    const formattedEndDate = dateEnd.toISOString().split('T')[0];


    const dateFromInput = await page.$('input#attribute_date_from');
    if (dateFromInput) {
        await dateFromInput.click({ clickCount: 3 });
        await dateFromInput.press('Backspace');
        await dateFromInput.type(formattedEndDate);
    } else {
        throw new Error('Date from input not found');
    }

    const dateToInput = await page.$('input#attribute_date_to');
    if (dateToInput) {
        await dateToInput.click({ clickCount: 3 });
        await dateToInput.press('Backspace');
        await dateToInput.type(formattedStartDate);

    } else {
        throw new Error('Date to input not found');
    }

    const searchButtonSelector = 'button.ui-button-secondary.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only';

    await page.waitForSelector(searchButtonSelector, { state: 'visible', timeout: 10000 });
    await page.click(searchButtonSelector);
    await page.waitForSelector('.ui-table-wrapper', { timeout: 10000 });
    await enqueueLinks({
        selector: 'a.pwplist-item-link',
        label: 'DETAIL',
    });

    let nextPageButton = await page.$('a.ui-paginator-next.ui-paginator-element.ui-state-default.ui-corner-all:not(.ui-state-disabled)');
    while (nextPageButton) {

        await nextPageButton.click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');
        await enqueueLinks({
            selector: 'a.pwplist-item-link',
            label: 'DETAIL',
        });
        nextPageButton = await page.$('a.ui-paginator-next.ui-paginator-element.ui-state-default.ui-corner-all:not(.ui-state-disabled)');
    }
}