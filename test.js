const { decodeGoogleNewsUrl } = require('./google-news-decoder-node');

(async () => {
    const sourceUrl = "https://news.google.com/read/CBMihgFBVV95cUxNSVpoZUhDaC05aWUzR1A5bXVJX1V6MEx6ckZwS2g4ajVxVmVkZWRjTmQ5Z254WmJBdXlrQTQ3MGNpdEpNWmxtMjNGN2h3djFZdTRuaVdRTVBma2NwLXdtV3c2UkJfVFJ2OGVRQ3FVRHlQcXNIZWdCdHNrXzFHeXpHZDk2WnRaQQ?hl=en-US&gl=US&ceid=US%3Aen";
    const interval = 1000; // Optional delay in milliseconds

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
