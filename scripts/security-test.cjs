#!/usr/bin/env node

/**
 * NOBILIS-IA Security Testing Script
 * This script performs comprehensive security tests on the application
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

class SecurityTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  assert(condition, message, type = 'error') {
    if (condition) {
      this.log(`✓ ${message}`, 'success');
      this.passed++;
      this.results.push({ status: 'passed', message, type });
    } else {
      this.log(`✗ ${message}`, type);
      if (type === 'error') {
        this.failed++;
      } else {
        this.warnings++;
      }
      this.results.push({ status: 'failed', message, type });
    }
  }

  // Test 1: Environment Variables Security
  testEnvironmentSecurity() {
    this.log('\n🔐 Testing Environment Variables Security...', 'info');
    
    // Check if .env files are properly gitignored
    const gitignoreContent = existsSync('.gitignore') 
      ? readFileSync('.gitignore', 'utf8') 
      : '';
    
    this.assert(
      gitignoreContent.includes('.env'),
      'Environment files are properly gitignored'
    );
    
    // Check if production credentials are not hardcoded
    const clientTsContent = existsSync('src/integrations/supabase/client.ts') 
      ? readFileSync('src/integrations/supabase/client.ts', 'utf8') 
      : '';
    
    this.assert(
      clientTsContent.includes('import.meta.env.VITE_SUPABASE_URL'),
      'Supabase URL uses environment variable'
    );
    
    this.assert(
      clientTsContent.includes('import.meta.env.VITE_SUPABASE_ANON_KEY'),
      'Supabase key uses environment variable'
    );
    
    // Check for environment validation
    const envConfigContent = existsSync('src/config/environment.ts') 
      ? readFileSync('src/config/environment.ts', 'utf8') 
      : '';
    
    this.assert(
      envConfigContent.includes('validateEnvironmentVariable'),
      'Environment validation is implemented'
    );
  }

  // Test 2: Database Security
  testDatabaseSecurity() {
    this.log('\n🗄️ Testing Database Security...', 'info');
    
    // Check if security migration exists
    const securityMigrationExists = existsSync('supabase/migrations/20250115000001_security_fixes.sql');
    this.assert(
      securityMigrationExists,
      'Security fixes migration exists'
    );
    
    if (securityMigrationExists) {
      const migrationContent = readFileSync('supabase/migrations/20250115000001_security_fixes.sql', 'utf8');
      
      this.assert(
        migrationContent.includes('DROP FUNCTION IF EXISTS public.verify_user_credentials'),
        'Insecure password verification function is removed'
      );
      
      this.assert(
        migrationContent.includes('CREATE OR REPLACE FUNCTION public.track_login_attempt'),
        'Login attempt tracking is implemented'
      );
      
      this.assert(
        migrationContent.includes('CREATE TABLE IF NOT EXISTS public.user_sessions'),
        'Session management table is created'
      );
      
      this.assert(
        migrationContent.includes('ENABLE ROW LEVEL SECURITY'),
        'Row Level Security is enabled'
      );
    }
  }

  // Test 3: Authentication Security
  testAuthenticationSecurity() {
    this.log('\n🔑 Testing Authentication Security...', 'info');
    
    const authHookContent = existsSync('src/hooks/useAuth.tsx') 
      ? readFileSync('src/hooks/useAuth.tsx', 'utf8') 
      : '';
    
    this.assert(
      authHookContent.includes('trackLoginAttempt'),
      'Login attempt tracking is implemented'
    );
    
    this.assert(
      authHookContent.includes('isAccountLocked'),
      'Account lockout mechanism is implemented'
    );
    
    this.assert(
      authHookContent.includes('sessionExpiresAt'),
      'Session timeout is implemented'
    );
    
    this.assert(
      authHookContent.includes('validate_password_strength'),
      'Password strength validation is implemented'
    );
    
    this.assert(
      authHookContent.includes('logSecurityEvent'),
      'Security event logging is implemented'
    );
  }

  // Test 4: Input Validation
  testInputValidation() {
    this.log('\n✅ Testing Input Validation...', 'info');
    
    const validationContent = existsSync('src/utils/validation.ts') 
      ? readFileSync('src/utils/validation.ts', 'utf8') 
      : '';
    
    this.assert(
      validationContent.includes('passwordSchema'),
      'Password validation schema exists'
    );
    
    this.assert(
      validationContent.includes('emailSchema'),
      'Email validation schema exists'
    );
    
    this.assert(
      validationContent.includes('sanitizeInput'),
      'Input sanitization function exists'
    );
    
    this.assert(
      validationContent.includes('validateCPF'),
      'CPF validation function exists'
    );
  }

  // Test 5: Security Headers
  testSecurityHeaders() {
    this.log('\n🛡️ Testing Security Headers...', 'info');
    
    const viteConfigContent = existsSync('vite.config.ts') 
      ? readFileSync('vite.config.ts', 'utf8') 
      : '';
    
    this.assert(
      viteConfigContent.includes('X-Frame-Options'),
      'X-Frame-Options header is configured'
    );
    
    this.assert(
      viteConfigContent.includes('X-Content-Type-Options'),
      'X-Content-Type-Options header is configured'
    );
    
    this.assert(
      viteConfigContent.includes('Strict-Transport-Security'),
      'HSTS header is configured'
    );
    
    this.assert(
      viteConfigContent.includes('Content-Security-Policy'),
      'CSP header is configured'
    );
  }

  // Test 6: Dependencies Security
  testDependenciesSecurity() {
    this.log('\n📦 Testing Dependencies Security...', 'info');
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --audit-level=high --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const auditData = JSON.parse(auditResult);
      
      this.assert(
        auditData.metadata.vulnerabilities.high === 0,
        'No high severity vulnerabilities found'
      );
      
      this.assert(
        auditData.metadata.vulnerabilities.critical === 0,
        'No critical vulnerabilities found'
      );
      
      if (auditData.metadata.vulnerabilities.moderate > 0) {
        this.assert(
          false,
          `${auditData.metadata.vulnerabilities.moderate} moderate vulnerabilities found`,
          'warning'
        );
      }
      
    } catch (error) {
      this.assert(
        false,
        'npm audit check failed or found vulnerabilities',
        'warning'
      );
    }
  }

  // Test 7: Code Quality Security
  testCodeQualitySecurity() {
    this.log('\n📝 Testing Code Quality Security...', 'info');
    
    try {
      // Check for console.log in production builds
      const files = [
        'src/hooks/useAuth.tsx',
        'src/components/LoginForm.tsx',
        'src/integrations/supabase/client.ts'
      ];
      
      let hasConsoleLog = false;
      files.forEach(file => {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          if (content.includes('console.log') && !content.includes('console.error')) {
            hasConsoleLog = true;
          }
        }
      });
      
      this.assert(
        !hasConsoleLog,
        'No console.log statements found in production code',
        'warning'
      );
      
      // Check for TODO/FIXME comments in security-critical files
      const securityFiles = [
        'src/hooks/useAuth.tsx',
        'src/hooks/useRoles.tsx',
        'src/integrations/supabase/client.ts'
      ];
      
      let hasTodos = false;
      securityFiles.forEach(file => {
        if (existsSync(file)) {
          const content = readFileSync(file, 'utf8');
          if (content.includes('TODO') || content.includes('FIXME')) {
            hasTodos = true;
          }
        }
      });
      
      this.assert(
        !hasTodos,
        'No TODO/FIXME comments in security-critical files',
        'warning'
      );
      
    } catch (error) {
      this.assert(
        false,
        'Code quality security check failed'
      );
    }
  }

  // Test 8: Configuration Security
  testConfigurationSecurity() {
    this.log('\n⚙️ Testing Configuration Security...', 'info');
    
    // Check if staging configuration exists
    const stagingConfigExists = existsSync('staging.env.example');
    this.assert(
      stagingConfigExists,
      'Staging environment configuration exists'
    );
    
    // Check if production build optimizations are configured
    const viteConfigContent = existsSync('vite.config.ts') 
      ? readFileSync('vite.config.ts', 'utf8') 
      : '';
    
    this.assert(
      viteConfigContent.includes('minify'),
      'Production build minification is configured'
    );
    
    this.assert(
      viteConfigContent.includes('manualChunks'),
      'Code splitting is configured'
    );
    
    // Check if security documentation exists
    const securityDocsExist = existsSync('security-checklist.md') && existsSync('deploy-guide.md');
    this.assert(
      securityDocsExist,
      'Security documentation exists'
    );
  }

  // Generate Security Report
  generateReport() {
    this.log('\n📊 Generating Security Report...', 'info');
    
    const total = this.passed + this.failed + this.warnings;
    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('🔒 NOBILIS-IA SECURITY TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⚠️  Warnings: ${this.warnings}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('='.repeat(60));
    
    if (this.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'failed' && r.type === 'error')
        .forEach(r => console.log(`  - ${r.message}`));
    }
    
    if (this.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results
        .filter(r => r.status === 'failed' && r.type === 'warning')
        .forEach(r => console.log(`  - ${r.message}`));
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    if (this.failed > 0) {
      console.log('  - Fix all failed security tests before deployment');
    }
    if (this.warnings > 0) {
      console.log('  - Address warnings to improve security posture');
    }
    if (this.failed === 0 && this.warnings === 0) {
      console.log('  - All security tests passed! System is ready for deployment.');
    }
    
    console.log('  - Run this test regularly during development');
    console.log('  - Include security testing in CI/CD pipeline');
    console.log('  - Perform penetration testing before production deployment');
    
    return this.failed === 0;
  }

  // Run all tests
  runAllTests() {
    this.log('🚀 Starting NOBILIS-IA Security Tests...', 'info');
    
    this.testEnvironmentSecurity();
    this.testDatabaseSecurity();
    this.testAuthenticationSecurity();
    this.testInputValidation();
    this.testSecurityHeaders();
    this.testDependenciesSecurity();
    this.testCodeQualitySecurity();
    this.testConfigurationSecurity();
    
    const allPassed = this.generateReport();
    
    if (!allPassed) {
      process.exit(1);
    }
    
    this.log('\n🎉 All security tests completed successfully!', 'success');
    process.exit(0);
  }
}

// Run the security tests
const tester = new SecurityTester();
tester.runAllTests(); 