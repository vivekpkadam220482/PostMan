# Gmail API E2E Testing Setup Guide

This guide will walk you through setting up the Gmail API E2E testing suite step by step.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js (v14.0.0 or higher) installed
- [ ] npm (v6.0.0 or higher) installed
- [ ] A Google account with Gmail access
- [ ] Administrative access to create Google Cloud projects
- [ ] Postman installed (optional, for GUI testing)

## 🔧 Step-by-Step Setup

### Step 1: Project Setup

1. **Clone or download the project**
   ```bash
   cd PostMan
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:newman
   ```

3. **Verify installation**
   ```bash
   newman --version
   node --version
   npm --version
   ```

### Step 2: Google Cloud Console Configuration

1. **Access Google Cloud Console**
   - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a new project** (or select existing)
   - Click "Select a project" → "New Project"
   - Enter project name: `gmail-api-testing`
   - Click "Create"

3. **Enable Gmail API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click on "Gmail API" and click "Enable"

4. **Configure OAuth consent screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Gmail API E2E Tests`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Add scopes (optional for testing)
   - Add test users: Your Gmail address
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Desktop application"
   - Name: `Gmail API E2E Testing Client`
   - Click "Create"
   - **IMPORTANT**: Copy and save the Client ID and Client Secret

### Step 3: OAuth 2.0 Authorization

1. **Run the OAuth setup helper**
   ```bash
   npm run setup:oauth
   ```

2. **Follow the authorization process**
   - The script will display an authorization URL
   - Copy the URL and open it in your browser
   - Sign in with your Google account
   - Grant the requested permissions:
     - Read your email messages and settings
     - Send email on your behalf
     - Manage your email labels
   - Copy the authorization code from the browser

3. **Update environment file**
   - Open `environments/Gmail_API_Development.postman_environment.json`
   - Replace the empty values:
   ```json
   {
     "key": "client_id",
     "value": "YOUR_CLIENT_ID_HERE"
   },
   {
     "key": "client_secret", 
     "value": "YOUR_CLIENT_SECRET_HERE"
   }
   ```

### Step 4: Get Refresh Token

You have two options to get the refresh token:

#### Option A: Using Postman GUI

1. **Import collection and environment**
   - Open Postman
   - Import `collections/Gmail_API_E2E_Tests.postman_collection.json`
   - Import `environments/Gmail_API_Development.postman_environment.json`

2. **Configure OAuth 2.0**
   - Select the imported environment
   - In the collection's Authorization tab:
     - Type: OAuth 2.0
     - Add auth data to: Request Headers
     - Access Token URL: `https://oauth2.googleapis.com/token`
     - Auth URL: `https://accounts.google.com/o/oauth2/auth`
     - Client ID: `{{client_id}}`
     - Client Secret: `{{client_secret}}`
     - Scope: `https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.labels`
   - Click "Get New Access Token"
   - Complete the OAuth flow
   - Copy the refresh token from the response

#### Option B: Using the OAuth Helper Script

1. **Modify the setup script**
   - Edit `scripts/setup_oauth.js`
   - Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your actual values
   - Run the script with your authorization code

2. **Exchange code for tokens**
   ```bash
   node scripts/setup_oauth.js
   ```

3. **Update environment with refresh token**
   - Add the refresh token to your environment file:
   ```json
   {
     "key": "refresh_token",
     "value": "YOUR_REFRESH_TOKEN_HERE"
   }
   ```

### Step 5: Test the Setup

1. **Run smoke tests**
   ```bash
   npm run test:smoke
   ```

2. **Expected output**
   ```
   🔥 Running Gmail API Smoke Tests...
   📁 Collection: .../Gmail_API_E2E_Tests.postman_collection.json
   🌍 Environment: .../Gmail_API_Development.postman_environment.json
   
   Gmail API E2E Tests
   
   → Authentication / Get OAuth Token
     POST https://oauth2.googleapis.com/token [200 OK, 1.2KB, 1.2s]
     ✓ OAuth token received
   
   → Profile & User Info / Get User Profile  
     GET https://gmail.googleapis.com/gmail/v1/users/me/profile [200 OK, 456B, 834ms]
     ✓ User profile retrieved successfully
   
   ✅ All tests passed!
   ```

3. **If tests fail**
   - Check your OAuth credentials
   - Verify the Gmail API is enabled
   - Ensure the refresh token is valid
   - Review the error messages in the reports

### Step 6: Production Environment Setup (Optional)

1. **Create production credentials**
   - Repeat Steps 2-4 for production Google Cloud project
   - Use separate OAuth client for production

2. **Update production environment**
   - Edit `environments/Gmail_API_Production.postman_environment.json`
   - Add production credentials

3. **Test production setup**
   ```bash
   npm run test:prod:smoke
   ```

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] Node.js and npm are installed and working
- [ ] Newman CLI is installed globally
- [ ] Google Cloud project has Gmail API enabled
- [ ] OAuth 2.0 credentials are created and configured
- [ ] Environment files contain valid credentials
- [ ] Smoke tests pass successfully
- [ ] Test reports are generated in `reports/` directory

## 🚨 Troubleshooting Common Issues

### Issue: "Client ID not found" error
**Solution**: Ensure your Client ID is correctly copied and pasted without extra spaces.

### Issue: "Access blocked" during OAuth flow
**Solution**: 
1. Add your email as a test user in OAuth consent screen
2. Ensure your app is in "Testing" mode
3. Try using an incognito browser window

### Issue: "Refresh token not provided" error
**Solution**: 
1. Make sure `access_type=offline` is in the OAuth URL
2. Use `prompt=consent` to force re-consent
3. Ensure you're using a "Desktop application" OAuth client type

### Issue: Tests timeout or fail
**Solution**:
1. Check your internet connection
2. Verify Gmail API quotas in Google Cloud Console
3. Increase timeout values in Newman configuration

### Issue: "Invalid scope" error
**Solution**: Ensure all required scopes are enabled in your OAuth consent screen.

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: Look at the detailed error messages in test reports
2. **Review Google Cloud Console**: Check API quotas and error logs
3. **Verify credentials**: Double-check all OAuth 2.0 configuration
4. **Check permissions**: Ensure your Google account has necessary permissions

## 🎉 Success!

Once setup is complete, you can:

- Run automated tests using npm scripts
- Generate comprehensive test reports
- Integrate tests into CI/CD pipelines
- Extend tests with additional Gmail API functionality

**Next Steps**: Review the main [README.md](README.md) for detailed usage instructions and advanced configuration options.