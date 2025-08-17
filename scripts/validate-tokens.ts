#!/usr/bin/env tsx

import process from 'node:process';

export interface TokenValidation {
  name: string;
  envVar: string;
  required: boolean;
  isValid: boolean;
  error?: string;
}

/**
 * Validate that required publishing tokens are available
 */
export function validateTokens(): TokenValidation[] {
  const tokens: TokenValidation[] = [
    {
      name: 'GitHub Token',
      envVar: 'GITHUB_TOKEN',
      required: true,
      isValid: false,
    },
    {
      name: 'VS Code Marketplace Token',
      envVar: 'VSCE_TOKEN',
      required: true,
      isValid: false,
    },
    {
      name: 'OpenVSIX Token',
      envVar: 'OVSX_TOKEN',
      required: true,
      isValid: false,
    },
    {
      name: 'npm Token',
      envVar: 'NPM_TOKEN',
      required: true,
      isValid: false,
    },
  ];

  for (const token of tokens) {
    const value = process.env[token.envVar];

    if (typeof value !== 'string' || value.trim().length === 0) {
      token.isValid = false;
      token.error = `${token.envVar} environment variable is not set or empty`;
    } else if (value.length < 10) {
      token.isValid = false;
      token.error = `${token.envVar} appears to be too short (less than 10 characters)`;
    } else {
      token.isValid = true;
    }
  }

  return tokens;
}

/**
 * Check if all required tokens are valid
 */
export function allTokensValid(): boolean {
  const tokens = validateTokens();
  return tokens.filter((t) => t.required).every((t) => t.isValid);
}

/**
 * Get summary of token validation
 */
export function getTokenValidationSummary(): {
  valid: number;
  invalid: number;
  total: number;
} {
  const tokens = validateTokens();
  const validCount = tokens.filter((t) => t.isValid).length;
  const invalidCount = tokens.filter((t) => !t.isValid).length;

  return {
    valid: validCount,
    invalid: invalidCount,
    total: tokens.length,
  };
}

// CLI execution
if (require.main === module) {
  console.log('🔑 Validating publishing tokens...\n');

  const tokens = validateTokens();

  for (const token of tokens) {
    const status = token.isValid ? '✅' : '❌';
    const requiredText = token.required ? ' (required)' : ' (optional)';

    console.log(`${status} ${token.name}${requiredText}`);
    if (
      !token.isValid &&
      typeof token.error === 'string' &&
      token.error.length > 0
    ) {
      console.log(`   Error: ${token.error}`);
    }
  }

  const summary = getTokenValidationSummary();
  console.log(`\n📊 Summary: ${summary.valid}/${summary.total} tokens valid`);

  if (allTokensValid()) {
    console.log('🎉 All required tokens are valid! Publishing can proceed.');
    process.exit(0);
  } else {
    console.log(
      '❌ Some required tokens are missing or invalid. Publishing blocked.',
    );
    console.log('\nPlease ensure the following environment variables are set:');
    for (const token of tokens.filter((t) => t.required && !t.isValid)) {
      console.log(`  - ${token.envVar}`);
    }
    process.exit(1);
  }
}
