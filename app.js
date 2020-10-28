const puppeteer = require('puppeteer');

const codesUrl = 'https://www.iso.org/obp/ui/#search/code/';

const selectXPath = "//div[@class='v-slot v-slot-search-header']//div[@class='v-select v-widget']/select[@class='v-select-select']";
const spinnerXpath = "//div[@class='v-loading-indicator first']";
const tableXPath = "//div[@class='v-grid v-widget v-has-width country-code v-grid-country-code']//div[@class='v-grid-tablewrapper']//table";

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        slowMo: 100
    });

    const page = await browser.newPage();
    await page.goto(codesUrl, {waitUntil: 'networkidle2'});

    try {
        await page.waitForXPath(spinnerXpath, {visible: true, timeout: 5000});
        await page.waitForXPath(spinnerXpath), {visible: false, timeout: 5000};
        await page.waitForXPath(selectXPath, {visible: true, timeout: 5000});
    } catch (e) {
    }

    await page.waitForTimeout(100);
    const select = (await page.$x(selectXPath))[0];
    await page.waitForTimeout(100);
    await select.click();
    await page.waitForTimeout(100);
    await select.type('300');
    await select.press('Enter');

    await page.waitForXPath(spinnerXpath), {visible: false, timeout: 5000};
    await page.waitForXPath(selectXPath, {visible: true, timeout: 5000});
    await page.waitForXPath(tableXPath, {visible: true, timeout: 5000});
    await page.waitForTimeout(500);

    const table = (await page.$x(tableXPath))[0];
    const headers = await Promise.all((await table.$x('./thead/tr/th/div')).map(async (h) => await (await h.getProperty('textContent')).jsonValue()));
    const rows = await Promise.all((await table.$x("./tbody/tr[@role='row']")).map(async (row) => {
        let tds = await row.$x('./td');
        return await Promise.all(tds.map(async (td) => await (await td.getProperty('textContent')).jsonValue()));
    }));

    await browser.close();

    const data = rows.reduce((agg, arr) => {
        agg.push(arr.reduce((obj, item, index) => {
            obj[headers[index]] = item;
            return obj;
        }, {}));
        return agg;
    }, []);

    console.log(JSON.stringify(data));
})();
