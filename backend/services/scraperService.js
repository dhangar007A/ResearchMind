const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes clean text content from a given URL.
 * Strips script, style, nav, and footer elements, then returns the first 3000 characters.
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function scrapeUrl(url) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted tags
    $('script, style, nav, footer, iframe, header, noscript').remove();

    // Get clean text with space separator
    let text = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    // Limit text length to 3000 chars (consistent with Python agent)
    return text.substring(0, 3000);
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
}

module.exports = {
  scrapeUrl
};
