const express = require('express');
const pup = require('puppeteer');
const app = express();
const port = 4000;

(async () => {
	// we will launch the headless browser instance when the server is first booting
	const browser = await pup.launch();
	try {
		// here we will be listing to all [GET] requests
		app.get('*', async (req, res) => {
			// TODO: it is best if you can validate that the request is in the expected format

			// for every request we will need to create a new page
			const page = await browser.newPage();
			/* 
				* TODO: Implement a redis cache so you don't want to open a new Page for a request
				* that you process a moment ago 
			*/

			// we need to make sure that we wait until all our API / Network calls are completed to get the final DOM
			await page.goto(req.url.substr(1, req.url.length), {
				waitUntil: 'networkidle0'
			});
			const html = await page.evaluate(() => {
				return document.documentElement.innerHTML;
			})
			
			// this will serve as a solution for a memory leak that I encountered
			await page.goto('about:blank');

			// after we evaluate the page we need to close is so that it does not jog up memeory
			await page.removeAllListeners('response');
			page.close();
			
			// finally send the HTML that we extracted as the response
			res.send(html);
		})
	} catch (e) {
		console.error(e);
	}
})();

app.listen(port, () => console.log(`listning on port ${port}`));