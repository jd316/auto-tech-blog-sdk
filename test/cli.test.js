import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '..', 'cli.js');

describe('CLI Tests', () => {
  test('--help flag shows help message', () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' });
    expect(output).toContain('auto-tech-blog - Generate AI-powered tech blog posts');
    expect(output).toContain('Usage:');
    expect(output).toContain('Options:');
    expect(output).toContain('Environment Variables:');
  });

  test('-h flag shows help message', () => {
    const output = execSync(`node ${cliPath} -h`, { encoding: 'utf8' });
    expect(output).toContain('auto-tech-blog - Generate AI-powered tech blog posts');
  });

  test('--version flag shows version', () => {
    const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' });
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('-v flag shows version', () => {
    const output = execSync(`node ${cliPath} -v`, { encoding: 'utf8' });
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('missing GEMINI_API_KEY shows error', () => {
    try {
      execSync(`node ${cliPath}`, { 
        encoding: 'utf8',
        env: { ...process.env, GEMINI_API_KEY: '' }
      });
      fail('Should have thrown error');
    } catch (error) {
      expect(error.stdout).toContain('Error: GEMINI_API_KEY environment variable is required');
      expect(error.stdout).toContain('Get your API key from: https://aistudio.google.com/');
    }
  });
}); 