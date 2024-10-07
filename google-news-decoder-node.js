const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extracts the base64 string from a Google News URL.
 * 
 * @param {string} sourceUrl - The Google News article URL.
 * @returns {Object} An object containing 'status' and 'base64Str' if successful, otherwise 'status' and 'message'.
 */
function getBase64Str(sourceUrl) {
    try {
        const url = new URL(sourceUrl);
        const pathParts = url.pathname.split('/');
        if (url.hostname === 'news.google.com' && pathParts.length > 1 && ['articles', 'read'].includes(pathParts[pathParts.length - 2])) {
            return { status: true, base64Str: pathParts[pathParts.length - 1] };
        }
        return { status: false, message: 'Invalid Google News URL format.' };
    } catch (error) {
        return { status: false, message: `Error in getBase64Str: ${error.message}` };
    }
}

/**
 * Fetches signature and timestamp required for decoding from Google News.
 * Tries https://news.google.com/articles/{base64Str} first, then falls back to https://news.google.com/rss/articles/{base64Str}.
 * 
 * @param {string} base64Str - The base64 string extracted from the Google News URL.
 * @returns {Object} An object containing 'status', 'signature', 'timestamp', and 'base64Str' if successful, otherwise 'status' and 'message'.
 */
async function getDecodingParams(base64Str) {
    try {
        const articleUrl = `https://news.google.com/articles/${base64Str}`;
        let response = await axios.get(articleUrl);
        let $ = cheerio.load(response.data);
        let dataElement = $('c-wiz > div[jscontroller]');
        if (!dataElement.length) throw new Error('Failed to fetch data attributes from Google News with the articles URL.');

        return {
            status: true,
            signature: dataElement.attr('data-n-a-sg'),
            timestamp: dataElement.attr('data-n-a-ts'),
            base64Str
        };
    } catch (error) {
        try {
            const rssUrl = `https://news.google.com/rss/articles/${base64Str}`;
            let response = await axios.get(rssUrl);
            let $ = cheerio.load(response.data);
            let dataElement = $('c-wiz > div[jscontroller]');
            if (!dataElement.length) throw new Error('Failed to fetch data attributes from Google News with the RSS URL.');

            return {
                status: true,
                signature: dataElement.attr('data-n-a-sg'),
                timestamp: dataElement.attr('data-n-a-ts'),
                base64Str
            };
        } catch (rssError) {
            return { status: false, message: `Request error in getDecodingParams with RSS URL: ${rssError.message}` };
        }
    }
}

/**
 * Decodes the Google News URL using the signature and timestamp.
 * 
 * @param {string} signature - The signature required for decoding.
 * @param {string} timestamp - The timestamp required for decoding.
 * @param {string} base64Str - The base64 string from the Google News URL.
 * @returns {Object} An object containing 'status' and 'decodedUrl' if successful, otherwise 'status' and 'message'.
 */
async function decodeUrl(signature, timestamp, base64Str) {
    try {
        const url = 'https://news.google.com/_/DotsSplashUi/data/batchexecute';
        const payload = [
            "Fbv4je",
            `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0], "${base64Str}",${timestamp},"${signature}"]`
        ];
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        };
        
        const response = await axios.post(url, `f.req=${encodeURIComponent(JSON.stringify([[payload]]))}`, { headers });
        const parsedData = JSON.parse(response.data.split('\n\n')[1]).slice(0, -2);
        const decodedUrl = JSON.parse(parsedData[0][2])[1];

        return { status: true, decodedUrl };
    } catch (error) {
        return { status: false, message: `Error in decodeUrl: ${error.message}` };
    }
}

/**
 * Decodes a Google News article URL into its original source URL.
 * 
 * @param {string} sourceUrl - The Google News article URL.
 * @param {number} interval - Delay time in milliseconds before decoding to avoid rate limits.
 * @returns {Object} An object containing 'status' and 'decodedUrl' if successful, otherwise 'status' and 'message'.
 */
async function decodeGoogleNewsUrl(sourceUrl, interval = 0) {
    try {
        const base64Response = getBase64Str(sourceUrl);
        if (!base64Response.status) return base64Response;

        const decodingParamsResponse = await getDecodingParams(base64Response.base64Str);
        if (!decodingParamsResponse.status) return decodingParamsResponse;

        if (interval) await new Promise(resolve => setTimeout(resolve, interval));

        const { signature, timestamp, base64Str } = decodingParamsResponse;
        return await decodeUrl(signature, timestamp, base64Str);
    } catch (error) {
        return { status: false, message: `Error in decodeGoogleNewsUrl: ${error.message}` };
    }
}

module.exports = {
    getBase64Str,
    getDecodingParams,
    decodeUrl,
    decodeGoogleNewsUrl,
};
