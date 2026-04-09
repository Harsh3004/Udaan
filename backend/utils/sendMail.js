const { google } = require('googleapis');
require('dotenv').config();

// Initialize the OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

// Set the Refresh Token
oauth2Client.setCredentials({ 
    refresh_token: process.env.GMAIL_REFRESH_TOKEN 
});

// Initialize the Gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

const sendMail = async (email, subject, text, html) => {
    try {
        // 1. Properly encode the subject line to prevent character corruption
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

        // 2. Construct the raw email format (RFC 2822)
        const messageParts = [
            `From: Udaan <${process.env.MAIL_USER}>`,
            `To: ${email}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            html || text 
        ];
        const message = messageParts.join('\n');

        // 3. Encode the entire email in base64url format (Required by Gmail API)
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // 4. Send the HTTP request to the Gmail API
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log(`Mail sent successfully via HTTP: ${response.data.id}`);
        return response.data;
        
    } catch (err) {
        console.error(`CRITICAL: Error while sending mail over HTTP: ${err.message}`);
        throw err; 
    }
};

module.exports = sendMail;