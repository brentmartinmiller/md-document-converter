import { convertMarkdown, frontmatterPlugin, syntaxHighlightPlugin } from '../src';
import type { ConversionOptions, ConversionResult } from '../src/types';
import path from 'path';
import fs from 'fs/promises';

// Example markdown content
const markdownContent = `---
title: Test Document
author: John Doe
date: 2024-02-14
---

# Hello World

This is a test document with some **bold** and *italic* text.

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table Example

| Name  | Age | Role    |
|-------|-----|---------|
| John  | 30  | Admin   |
| Jane  | 25  | Editor  |

## List Example

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
`;

async function runExamples() {
  try {
    // Ensure our examples directory exists
    const examplesDir = path.join(process.cwd(), 'examples', 'output');
    await fs.mkdir(examplesDir, { recursive: true });

    // Write test markdown file
    const inputPath = path.join(examplesDir, 'test.md');
    await fs.writeFile(inputPath, markdownContent);

    // Example 1: Basic HTML conversion
    console.log('\n1. Basic HTML conversion');
    const htmlResult = await convertMarkdown(inputPath, {
      outputFormat: 'html',
      outputPath: path.join(examplesDir, 'output.html')
    });
    console.log('HTML conversion completed:', htmlResult.outputPath);

    // Example 2: PDF conversion with custom CSS
    console.log('\n2. PDF conversion with custom CSS');
    const customCss = `
      body { font-family: Arial, sans-serif; }
      h1 { color: navy; }
      code { background-color: #f4f4f4; padding: 2px 4px; }
    `;
    const cssPath = path.join(examplesDir, 'custom.css');
    await fs.writeFile(cssPath, customCss);

    const pdfResult = await convertMarkdown(inputPath, {
      outputFormat: 'pdf',
      outputPath: path.join(examplesDir, 'output.pdf'),
      cssFile: cssPath
    });
    console.log('PDF conversion completed:', pdfResult.outputPath);

    // Example 3: Word conversion with plugins
    console.log('\n3. Word conversion with plugins');
    const wordResult = await convertMarkdown(inputPath, {
      outputFormat: 'docx',
      outputPath: path.join(examplesDir, 'output.docx'),
      plugins: [frontmatterPlugin, syntaxHighlightPlugin]
    });
    console.log('Word conversion completed:', wordResult.outputPath);

    // Example 4: Batch conversion
    console.log('\n4. Batch conversion example');
    const batchResults = await Promise.all([
      'doc1.md',
      'doc2.md',
      'doc3.md'
    ].map(async (filename) => {
      const inputFile = path.join(examplesDir, filename);
      await fs.writeFile(inputFile, markdownContent);

      return convertMarkdown(inputFile, {
        outputFormat: 'pdf',
        outputPath: path.join(examplesDir, `${path.parse(filename).name}.pdf`)
      });
    }));
    console.log('Batch conversion completed:', batchResults.map(r => r.outputPath));

    // Example 5: Custom plugin
    console.log('\n5. Custom plugin example');
    const timestampPlugin = {
      name: 'timestamp',
      beforeConvert: async (content: string) => {
        return `Last converted: ${new Date().toISOString()}\n\n${content}`;
      },
      afterConvert: async (result: ConversionResult) => {
        console.log(`Conversion completed at: ${new Date().toISOString()}`);
        return result;
      }
    };

    const customResult = await convertMarkdown(inputPath, {
      outputFormat: 'html',
      outputPath: path.join(examplesDir, 'with-timestamp.html'),
      plugins: [timestampPlugin]
    });
    console.log('Custom plugin conversion completed:', customResult.outputPath);

    // Example 6: Error handling
    console.log('\n6. Error handling example');
    try {
      await convertMarkdown('nonexistent.md', {
        outputFormat: 'pdf'
      });
    } catch (error) {
      console.error('Expected error:', (error as Error).message);
    }

    // Example 7: Advanced options
    console.log('\n7. Advanced options example');
    const advancedOptions: ConversionOptions = {
      outputFormat: 'html',
      outputPath: path.join(examplesDir, 'advanced.html'),
      cssFile: cssPath,
      plugins: [frontmatterPlugin, syntaxHighlightPlugin],
      metadata: {
        template: 'article',
        category: 'documentation'
      }
    };

    const advancedResult = await convertMarkdown(inputPath, advancedOptions);
    console.log('Advanced conversion completed:', advancedResult.outputPath);

    console.log('\nAll examples completed successfully!');
    console.log('Output files are in:', examplesDir);

  } catch (error) {
    console.error('Example failed:', (error as Error).message);
    process.exit(1);
  }
}

// Run the examples
runExamples().catch(console.error);

// How to run this example:
// 1. Compile typescript: npx tsc examples/example.ts
// 2. Run the example: node examples/example.js