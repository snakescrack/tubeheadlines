const https = require('https');

exports.handler = async function(event, context) {
    const { videoId } = event.queryStringParameters;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'YouTube API key is not configured.' })
        };
    }

    if (!videoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'videoId query parameter is required.' })
        };
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: 200,
                    body: data
                });
            });
        }).on('error', (err) => {
            resolve({
                statusCode: 500,
                body: JSON.stringify({ error: err.message })
            });
        });
    });
};
