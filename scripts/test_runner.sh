#!/bin/bash

# Gmail API E2E Test Runner Script
# This script provides a convenient way to run different types of tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v14.0.0 or higher."
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2)
    print_success "Node.js version: $node_version"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    npm_version=$(npm --version)
    print_success "npm version: $npm_version"
    
    # Check Newman
    if ! command -v newman &> /dev/null; then
        print_warning "Newman is not installed globally. Installing..."
        npm install -g newman
    fi
    
    newman_version=$(newman --version)
    print_success "Newman version: $newman_version"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing..."
        npm install
    fi
    
    print_success "All prerequisites are satisfied!"
}

# Function to validate environment
validate_environment() {
    local env_file="$1"
    
    print_status "Validating environment: $env_file"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi
    
    # Check if critical variables are set
    if ! grep -q '"client_id"' "$env_file" || ! grep -q '"client_secret"' "$env_file"; then
        print_error "Environment file is missing required OAuth credentials"
        print_warning "Please update $env_file with your OAuth client_id and client_secret"
        exit 1
    fi
    
    print_success "Environment validation passed!"
}

# Function to clean reports directory
clean_reports() {
    print_status "Cleaning old reports..."
    if [ -d "reports" ]; then
        rm -rf reports/*
        print_success "Reports directory cleaned!"
    else
        mkdir -p reports
        print_success "Reports directory created!"
    fi
}

# Function to run tests
run_tests() {
    local test_type="$1"
    local environment="$2"
    local iterations="$3"
    
    print_status "Running $test_type tests in $environment environment..."
    
    case $test_type in
        "smoke")
            node scripts/newman_runner.js smoke "$environment"
            ;;
        "full")
            node scripts/newman_runner.js full "$environment"
            ;;
        "performance")
            node scripts/newman_runner.js performance "$environment" "$iterations"
            ;;
        *)
            print_error "Unknown test type: $test_type"
            exit 1
            ;;
    esac
}

# Function to show test results
show_results() {
    print_status "Test execution completed!"
    
    if [ -d "reports" ] && [ "$(ls -A reports)" ]; then
        print_success "Test reports generated:"
        ls -la reports/
        
        # Find the latest HTML report
        latest_html=$(ls -t reports/*.html 2>/dev/null | head -n1)
        if [ -n "$latest_html" ]; then
            print_status "Latest HTML report: $latest_html"
            print_status "Open in browser: file://$(pwd)/$latest_html"
        fi
    else
        print_warning "No reports found in reports directory"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  smoke      Run smoke tests (quick validation)"
    echo "  full       Run full test suite"
    echo "  performance Run performance tests"
    echo "  setup      Check prerequisites and setup"
    echo "  clean      Clean reports directory"
    echo ""
    echo "Environments:"
    echo "  Development (default)"
    echo "  Production"
    echo ""
    echo "Options:"
    echo "  --iterations N    Number of iterations for performance tests (default: 5)"
    echo "  --clean          Clean reports before running tests"
    echo "  --validate       Validate environment before running tests"
    echo ""
    echo "Examples:"
    echo "  $0 smoke                           # Run smoke tests in Development"
    echo "  $0 full Production                 # Run full tests in Production"
    echo "  $0 performance Development --iterations 10  # Performance test with 10 iterations"
    echo "  $0 setup                           # Check prerequisites"
    echo "  $0 clean                           # Clean reports directory"
}

# Main script logic
main() {
    local command="${1:-smoke}"
    local environment="${2:-Development}"
    local iterations=5
    local clean_before=false
    local validate_env=false
    
    # Parse additional options
    shift 2 2>/dev/null || shift $# 2>/dev/null
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --iterations)
                iterations="$2"
                shift 2
                ;;
            --clean)
                clean_before=true
                shift
                ;;
            --validate)
                validate_env=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    case $command in
        "setup")
            check_prerequisites
            print_success "Setup completed successfully!"
            ;;
        "clean")
            clean_reports
            ;;
        "smoke"|"full"|"performance")
            check_prerequisites
            
            if [ "$validate_env" = true ]; then
                validate_environment "environments/Gmail_API_${environment}.postman_environment.json"
            fi
            
            if [ "$clean_before" = true ]; then
                clean_reports
            fi
            
            run_tests "$command" "$environment" "$iterations"
            show_results
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi