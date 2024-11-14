// tests/converter.test.ts

import fs from 'fs';
import path from 'path';
import { convertMarkdown } from '../src/converter';
import { ConversionOptions } from '../src/types';


describe('convertMarkdown', () => {
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
      if (fs.rmSync) {
        // Node.js v14.14.0 and above
        fs.rmSync(outputDir, { recursive: true, force: true });
      } else {
        // Below Node.js v14.14.0
        fs.rmdirSync(outputDir, { recursive: true });
      }
    }
  });

  it('should convert markdown to HTML', async () => {
    const options: ConversionOptions = {
      outputFormat: 'html',
      outputPath: path.join(outputDir, 'output.html'),
    };
  
    await convertMarkdown(inputFile, options);
  
    if (!options.outputPath) {
      throw new Error('Output path is undefined');
    }
  
    expect(fs.existsSync(options.outputPath)).toBe(true);
  
    const outputContent = fs.readFileSync(options.outputPath, 'utf-8');
    expect(outputContent).toContain('<h1 id="sample-markdown">Sample Markdown</h1>');
    expect(outputContent).toContain('<pre><code>typescript');
    expect(outputContent).toContain('<strong>bold</strong>');
  });
  
  it('should convert markdown to PDF', async () => {
    const options: ConversionOptions = {
      outputFormat: 'pdf',
      outputPath: path.join(outputDir, 'output.pdf'),
    };
  
    await convertMarkdown(inputFile, options);
  
    if (!options.outputPath) {
      throw new Error('Output path is undefined');
    }
  
    expect(fs.existsSync(options.outputPath)).toBe(true);
    // TO DO: Additional checks can be added to verify PDF content if needed
  });
  
  it('should convert markdown to DOCX', async () => {
    const options: ConversionOptions = {
      outputFormat: 'docx',
      outputPath: path.join(outputDir, 'output.docx'),
    };
  
    await convertMarkdown(inputFile, options);
  
    if (!options.outputPath) {
      throw new Error('Output path is undefined');
    }
  
    expect(fs.existsSync(options.outputPath)).toBe(true);
    // TO DO: Additional checks can be added to verify DOCX content if needed
  });
});