/**
 * Newman CLI Runner for Gmail API E2E Tests
 * This script runs Postman collections using Newman with comprehensive reporting
 */

const newman = require('newman');
const path = require('path');
const fs = require('fs');

class NewmanRunner {
    constructor() {
        this.collectionsDir = path.join(__dirname, '..', 'collections');
        this.environmentsDir = path.join(__dirname, '..', 'environments');
        this.dataDir = path.join(__dirname, '..', 'data');
        this.reportsDir = path.join(__dirname, '..', 'reports');
        
        // Ensure reports directory exists
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    /**
     * Run Gmail API E2E tests
     * @param {string} environment - Environment name (Development/Production)
     * @param {Object} options - Additional options
     */
    async runGmailTests(environment = 'Development', options = {}) {
        const collectionPath = path.join(this.collectionsDir, 'Gmail_API_E2E_Tests.postman_collection.json');
        const environmentPath = path.join(this.environmentsDir, `Gmail_API_${environment}.postman_environment.json`);
        const dataPath = path.join(this.dataDir, 'test_data.csv');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlReportPath = path.join(this.reportsDir, `gmail-e2e-report-${timestamp}.html`);
        const jsonReportPath = path.join(this.reportsDir, `gmail-e2e-report-${timestamp}.json`);
        const junitReportPath = path.join(this.reportsDir, `gmail-e2e-junit-${timestamp}.xml`);

        const runOptions = {
            collection: collectionPath,
            environment: environmentPath,
            data: dataPath,
            reporters: ['html', 'json', 'junit', 'cli'],
            reporter: {
                html: {
                    export: htmlReportPath
                },
                json: {
                    export: jsonReportPath
                },
                junit: {
                    export: junitReportPath
                }
            },
            iterationCount: options.iterations || 1,
            delayRequest: options.delay || 1000, // 1 second delay between requests
            timeout: options.timeout || 30000, // 30 seconds timeout
            insecure: false,
            bail: options.bail || false,
            color: 'on',
            ...options
        };

        console.log('🚀 Starting Gmail API E2E Tests...');
        console.log(`📁 Collection: ${collectionPath}`);
        console.log(`🌍 Environment: ${environmentPath}`);
        console.log(`📊 Data: ${dataPath}`);
        console.log(`📈 Reports will be saved to: ${this.reportsDir}`);
        console.log('=' .repeat(80));

        return new Promise((resolve, reject) => {
            newman.run(runOptions, (err, summary) => {
                if (err) {
                    console.error('❌ Newman run failed:', err);
                    reject(err);
                    return;
                }

                console.log('=' .repeat(80));
                console.log('📊 Test Execution Summary');
                console.log('=' .repeat(80));
                console.log(`Total Iterations: ${summary.run.stats.iterations.total}`);
                console.log(`Total Requests: ${summary.run.stats.requests.total}`);
                console.log(`Passed Requests: ${summary.run.stats.requests.total - summary.run.stats.requests.failed}`);
                console.log(`Failed Requests: ${summary.run.stats.requests.failed}`);
                console.log(`Total Assertions: ${summary.run.stats.assertions.total}`);
                console.log(`Passed Assertions: ${summary.run.stats.assertions.total - summary.run.stats.assertions.failed}`);
                console.log(`Failed Assertions: ${summary.run.stats.assertions.failed}`);
                console.log(`Average Response Time: ${summary.run.timings.responseAverage}ms`);
                console.log('=' .repeat(80));

                if (summary.run.failures.length > 0) {
                    console.log('❌ Test Failures:');
                    summary.run.failures.forEach((failure, index) => {
                        console.log(`${index + 1}. ${failure.error.name}: ${failure.error.message}`);
                        console.log(`   Source: ${failure.source.name || 'Unknown'}`);
                    });
                } else {
                    console.log('✅ All tests passed!');
                }

                console.log('');
                console.log('📁 Generated Reports:');
                console.log(`   HTML Report: ${htmlReportPath}`);
                console.log(`   JSON Report: ${jsonReportPath}`);
                console.log(`   JUnit Report: ${junitReportPath}`);

                resolve(summary);
            });
        });
    }

    /**
     * Run smoke tests (subset of tests for quick validation)
     */
    async runSmokeTests(environment = 'Development') {
        console.log('🔥 Running Gmail API Smoke Tests...');
        
        const smokeOptions = {
            folder: ['Authentication', 'Profile & User Info'],
            bail: true,
            iterations: 1
        };

        return this.runGmailTests(environment, smokeOptions);
    }

    /**
     * Run performance tests with multiple iterations
     */
    async runPerformanceTests(environment = 'Development', iterations = 5) {
        console.log('⚡ Running Gmail API Performance Tests...');
        
        const performanceOptions = {
            iterations: iterations,
            delay: 500, // Reduced delay for performance testing
            bail: false
        };

        return this.runGmailTests(environment, performanceOptions);
    }
}

// CLI interface
if (require.main === module) {
    const runner = new NewmanRunner();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'full';
    const environment = args[1] || 'Development';

    async function main() {
        try {
            switch (command.toLowerCase()) {
                case 'smoke':
                    await runner.runSmokeTests(environment);
                    break;
                case 'performance':
                    const iterations = parseInt(args[2]) || 5;
                    await runner.runPerformanceTests(environment, iterations);
                    break;
                case 'full':
                default:
                    await runner.runGmailTests(environment);
                    break;
            }
            
            console.log('🎉 Test execution completed!');
            process.exit(0);
        } catch (error) {
            console.error('💥 Test execution failed:', error.message);
            process.exit(1);
        }
    }

    main();
}

module.exports = NewmanRunner;