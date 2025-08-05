/**
 * Gmail API OAuth 2.0 Setup Helper Script
 * This script helps generate the authorization URL and handle the OAuth flow
 */

const { URL } = require('url');

class GmailOAuthHelper {
    constructor(clientId, clientSecret, redirectUri = 'urn:ietf:wg:oauth:2.0:oob') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.authUrl = 'https://accounts.google.com/o/oauth2/auth';
        this.tokenUrl = 'https://oauth2.googleapis.com/token';
        this.scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/gmail.modify'
        ];
    }

    /**
     * Generate authorization URL for OAuth flow
     * @returns {string} Authorization URL
     */
    generateAuthUrl() {
        const url = new URL(this.authUrl);
        url.searchParams.set('client_id', this.clientId);
        url.searchParams.set('redirect_uri', this.redirectUri);
        url.searchParams.set('scope', this.scopes.join(' '));
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('access_type', 'offline');
        url.searchParams.set('prompt', 'consent');
        
        return url.toString();
    }

    /**
     * Exchange authorization code for tokens
     * @param {string} authorizationCode - Authorization code from OAuth flow
     * @returns {Promise<Object>} Token response
     */
    async exchangeCodeForTokens(authorizationCode) {
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Refresh access token using refresh token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<Object>} New token response
     */
    async refreshAccessToken(refreshToken) {
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Print setup instructions
     */
    printSetupInstructions() {
        console.log('='.repeat(80));
        console.log('Gmail API OAuth 2.0 Setup Instructions');
        console.log('='.repeat(80));
        console.log('');
        console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
        console.log('2. Create a new project or select existing project');
        console.log('3. Enable Gmail API for your project');
        console.log('4. Create OAuth 2.0 credentials:');
        console.log('   - Go to APIs & Services > Credentials');
        console.log('   - Click "Create Credentials" > "OAuth 2.0 Client IDs"');
        console.log('   - Choose "Desktop application" as application type');
        console.log('   - Note down Client ID and Client Secret');
        console.log('');
        console.log('5. Update your Postman environment variables:');
        console.log('   - client_id: Your OAuth 2.0 Client ID');
        console.log('   - client_secret: Your OAuth 2.0 Client Secret');
        console.log('');
        console.log('6. Get authorization code:');
        console.log('   - Visit the authorization URL (generated below)');
        console.log('   - Grant permissions');
        console.log('   - Copy the authorization code');
        console.log('');
        console.log('7. Exchange code for tokens using the OAuth collection request');
        console.log('');
        console.log('Authorization URL:');
        console.log(this.generateAuthUrl());
        console.log('');
        console.log('='.repeat(80));
    }
}

// Example usage
if (require.main === module) {
    const helper = new GmailOAuthHelper('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');
    helper.printSetupInstructions();
}

module.exports = GmailOAuthHelper;