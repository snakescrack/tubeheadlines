const https = require('https');

exports.handler = async function(event, context) {
    const { videoId } = event.queryStringParameters;

    // Use oEmbed to check status without API key cost/limits
    // This is more lightweight for bulk checking
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            if (res.statusCode === 200) {
                // Video exists and is public
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ status: 'alive' })
                });
            } else {
                // Video is 404 (deleted) or 401 (private)
                resolve({
                    statusCode: 200, // Return 200 so the frontend can parse the JSON body
                    body: JSON.stringify({ status: 'dead', code: res.statusCode })
                });
            }
        });

        req.on('error', (err) => {
            resolve({
                statusCode: 500,
                body: JSON.stringify({ error: err.message })
            });
        });
    });
};
