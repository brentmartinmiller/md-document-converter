import { convertMarkdown } from '../src';
import { ConversionOptions } from '../src/types';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('md-document-converter', () => {
  const tempDir = path.join(os.tmpdir(), 'md-converter-test');
  
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    const testMd = `# Test Heading\n\nThis is a test paragraph.`;
    await fs.writeFile(path.join(tempDir, 'test.md'), testMd);
  });

  test('converts to HTML', async () => {
    const options: ConversionOptions = {
      outputFormat: 'html',
      outputPath: path.join(tempDir, 'test.html')
    };

    const result = await convertMarkdown(path.join(tempDir, 'test.md'), options);
    
    expect(result.success).toBe(true);
    const content = await fs.readFile(result.outputPath, 'utf-8');
    expect(content).toContain('<h1>Test Heading</h1>');
  });

  test('converts to PDF', async () => {
    const options: ConversionOptions = {
      outputFormat: 'pdf',
      outputPath: path.join(tempDir, 'test.pdf')
    };

    const result = await convertMarkdown(path.join(tempDir, 'test.md'), options);
    
    expect(result.success).toBe(true);
    const stats = await fs.stat(result.outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });

  test('converts to Word', async () => {
    const options: ConversionOptions = {
      outputFormat: 'docx',
      outputPath: path.join(tempDir, 'test.docx')
    };

    const result = await convertMarkdown(path.join(tempDir, 'test.md'), options);
    
    expect(result.success).toBe(true);
    const stats = await fs.stat(result.outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});