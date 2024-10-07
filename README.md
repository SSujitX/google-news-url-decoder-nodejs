# Google News Decoder for Node.js

Google News Decoder is a Node.js module that decodes Google News URLs into their original source URLs. It is designed for developers who want to extract the actual URLs behind Google News links.

## Features

- Decodes Google News URLs to their original source URLs.
- Supports fallback for different Google News URL formats.
- Easy to integrate into Node.js applications.

## Installation

Since this module is not published on npm, you can clone it directly from GitHub:

```bash
git clone https://github.com/SSujitX/google-news-decoder-nodejs.git
cd google-news-decoder-nodejs

npm install

## Usage

Create a file named example.js in the same directory with the following content:

```bash
const { decodeGoogleNewsUrl } = require('./google-news-decoder_node');

(async () => {
    const sourceUrl = "https://news.google.com/rss/articles/CBMiVkFVX3lxTE4zaGU2bTY2ZGkzdTRkSkJ0cFpsTGlDUjkxU2FBRURaTWU0c3QzVWZ1MHZZNkZ5Vzk1ZVBnTDFHY2R6ZmdCUkpUTUJsS1pqQTlCRzlzbHV3?oc=5";
    const interval = 5000; // Optional delay in milliseconds

    try {
        const result = await decodeGoogleNewsUrl(sourceUrl, interval);
        if (result.status) {
            console.log('Decoded URL:', result.decodedUrl);
        } else {
            console.error('Error:', result.message);
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error.message);
    }
})();

Run the example.js file:

node example.js

Example Output
If successful, you will see an output similar to this:

```bash
Decoded URL: https://www.original-source-article.com/...
