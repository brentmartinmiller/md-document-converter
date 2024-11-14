// tests/cli.test.ts

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

describe('CLI', () => {
  const cliPath = path.resolve(__dirname, '../dist/src/cli.js'); // Adjusted path
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const outputDir = path.resolve(__dirname, 'output');
  const inputFile = path.join(fixturesDir, 'sample.md');

  beforeAll(() => {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  });

  afterAll(() => {
    // Clean up output files after tests run
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should display help when -h flag is provided', (done) => {
    exec(`node ${cliPath} -h`, (error, stdout, stderr) => {
      const output = stdout + stderr;
      expect(output).toContain('Usage: mdconvert [options] <inputFile>');
      done();
    });
  }, 10000);

  it('should convert markdown to HTML via CLI', (done) => {
    const outputPath = path.join(outputDir, 'cli-output.html');
    exec(
      `node ${cliPath} ${inputFile} -f html -o ${outputPath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          done(error);
          return;
        }
        expect(fs.existsSync(outputPath)).toBe(true);
        const outputContent = fs.readFileSync(outputPath, 'utf-8');
        expect(outputContent).toContain('<h1 id="sample-markdown">Sample Markdown</h1>');
        expect(outputContent).toContain('<strong>bold</strong>');
        done();
      }
    );
  });

  it('should convert markdown to PDF via CLI', (done) => {
    const outputPath = path.join(outputDir, 'cli-output.pdf');
    exec(
      `node ${cliPath} ${inputFile} -f pdf -o ${outputPath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          done(error);
          return;
        }
        expect(fs.existsSync(outputPath)).toBe(true);
        done();
      }
    );
  }, 10000);

  it('should convert markdown to DOCX via CLI', (done) => {
    const outputPath = path.join(outputDir, 'cli-output.docx');
    exec(
      `node ${cliPath} ${inputFile} -f docx -o ${outputPath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          done(error);
          return;
        }
        expect(fs.existsSync(outputPath)).toBe(true);
        done();
      }
    );
  }, 10000);
});
