# Gmail API E2E Testing Suite with Postman

A comprehensive end-to-end testing suite for Gmail API functionality using Postman collections and Newman CLI automation. This project provides complete OAuth 2.0 authentication flow testing and covers all major Gmail API operations.

## 🚀 Features

- **Complete OAuth 2.0 Flow**: Automated authentication and token management
- **Comprehensive API Coverage**: Tests for emails, labels, user profile, and more
- **Environment Management**: Separate configurations for development and production
- **Automated Testing**: Newman CLI integration for CI/CD pipelines
- **Rich Reporting**: HTML, JSON, and JUnit report generation
- **Data-Driven Testing**: CSV-based test data management
- **Performance Testing**: Built-in performance and load testing capabilities

## 📁 Project Structure

```
PostMan/
├── collections/
│   └── Gmail_API_E2E_Tests.postman_collection.json
├── environments/
│   ├── Gmail_API_Development.postman_environment.json
│   └── Gmail_API_Production.postman_environment.json
├── data/
│   └── test_data.csv
├── scripts/
│   ├── setup_oauth.js
│   └── newman_runner.js
├── reports/
│   └── (generated test reports)
├── package.json
└── README.md
```

## 🛠️ Prerequisites

1. **Node.js** (v14.0.0 or higher)
2. **npm** (v6.0.0 or higher)
3. **Postman** (for GUI testing)
4. **Newman** (for CLI testing)
5. **Google Cloud Project** with Gmail API enabled

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
npm run install:newman
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Enable the Gmail API for your project:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application" as the application type
   - Note down your Client ID and Client Secret

### 3. OAuth 2.0 Configuration

Run the OAuth setup helper to get your authorization URL:

```bash
npm run setup:oauth
```

Follow the printed instructions to:
- Update your environment variables with Client ID and Client Secret
- Get the authorization code from Google
- Exchange the code for refresh token

### 4. Environment Configuration

Update the environment files with your credentials:

**For Development** (`environments/Gmail_API_Development.postman_environment.json`):
```json
{
  "client_id": "your-development-client-id",
  "client_secret": "your-development-client-secret", 
  "refresh_token": "your-refresh-token"
}
```

**For Production** (`environments/Gmail_API_Production.postman_environment.json`):
```json
{
  "client_id": "your-production-client-id",
  "client_secret": "your-production-client-secret",
  "refresh_token": "your-production-refresh-token"
}
```

## 🧪 Running Tests

### Using npm Scripts

```bash
# Run full test suite (Development)
npm test

# Run smoke tests (Development)
npm run test:smoke

# Run performance tests (Development)
npm run test:performance

# Run production tests
npm run test:prod
npm run test:prod:smoke
```

### Using Newman CLI Directly

```bash
# Full test suite
node scripts/newman_runner.js full Development

# Smoke tests
node scripts/newman_runner.js smoke Development

# Performance tests (5 iterations)
node scripts/newman_runner.js performance Development 5
```

### Using Postman GUI

1. Import the collection: `collections/Gmail_API_E2E_Tests.postman_collection.json`
2. Import the environment: `environments/Gmail_API_Development.postman_environment.json`
3. Configure your OAuth 2.0 credentials in the environment
4. Run the collection

## 📊 Test Coverage

### Authentication Tests
- OAuth 2.0 token acquisition
- Token refresh functionality
- Authentication validation

### User Profile Tests
- Retrieve user profile information
- Validate email address and account details

### Labels Management Tests
- List all labels
- Create new labels
- Delete test labels
- Label validation and cleanup

### Message Operations Tests
- List inbox messages
- Retrieve message details
- Send test emails
- Message validation and verification

### Cleanup Tests
- Remove test data
- Clean up created labels
- Environment reset

## 📈 Reporting

Test reports are automatically generated in the `reports/` directory:

- **HTML Report**: Detailed visual report with request/response data
- **JSON Report**: Machine-readable test results for CI/CD integration
- **JUnit Report**: XML format for Jenkins and other CI tools

### Report Locations
```
reports/
├── gmail-e2e-report-TIMESTAMP.html
├── gmail-e2e-report-TIMESTAMP.json
└── gmail-e2e-junit-TIMESTAMP.xml
```

## 🔧 Configuration Options

### Newman Runner Options

The Newman runner supports various configuration options:

```javascript
const options = {
  iterations: 1,           // Number of iterations
  delay: 1000,            // Delay between requests (ms)
  timeout: 30000,         // Request timeout (ms)
  bail: false,            // Stop on first failure
  folder: ['Authentication'], // Run specific folders only
};
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `client_id` | OAuth 2.0 Client ID | `123456789-abc.apps.googleusercontent.com` |
| `client_secret` | OAuth 2.0 Client Secret | `GOCSPX-abc123def456` |
| `refresh_token` | OAuth 2.0 Refresh Token | `1//04-abc123def456` |
| `access_token` | OAuth 2.0 Access Token | `ya29.a0abc123def456` |
| `base_url` | Gmail API Base URL | `https://gmail.googleapis.com/gmail/v1` |

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: Gmail API E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run test:smoke
        env:
          CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.GMAIL_CLIENT_SECRET }}
          REFRESH_TOKEN: ${{ secrets.GMAIL_REFRESH_TOKEN }}
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test:smoke'
            }
        }
        stage('Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: '*.html',
                    reportName: 'Gmail API Test Report'
                ])
            }
        }
    }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify OAuth 2.0 credentials are correct
   - Ensure Gmail API is enabled in Google Cloud Console
   - Check if refresh token is valid and not expired

2. **API Quota Exceeded**
   - Implement request delays in Newman runner
   - Monitor API usage in Google Cloud Console
   - Consider using exponential backoff for retries

3. **Network Timeouts**
   - Increase timeout values in Newman configuration
   - Check network connectivity and firewall settings

4. **Permission Errors**
   - Verify OAuth scopes include required permissions
   - Re-authorize the application if needed

### Debug Mode

Enable verbose logging by setting the debug flag:

```bash
DEBUG=newman* node scripts/newman_runner.js
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions and support:

1. Check the [Issues](https://github.com/yourusername/gmail-api-e2e-postman-tests/issues) page
2. Review the [Gmail API Documentation](https://developers.google.com/gmail/api)
3. Consult the [Postman Documentation](https://learning.postman.com/)

## 🏷️ Version History

- **v1.0.0** - Initial release with complete OAuth 2.0 flow and basic API testing
- **v1.1.0** - Added performance testing and enhanced reporting
- **v1.2.0** - CI/CD integration examples and improved error handling

---

**Happy Testing! 🎉**