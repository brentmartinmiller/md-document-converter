import { ConversionOptions, ConversionResult, ConverterPlugin } from './types';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { Document, Packer, Paragraph, HeadingLevel, SectionType } from 'docx';
import puppeteer from 'puppeteer';

export async function convertMarkdown(inputFile: string, options: ConversionOptions): Promise<ConversionResult> {
  const startTime = performance.now();

  await validateInputFile(inputFile);

  let content = await readInputFile(inputFile);
  const inputSize = Buffer.from(content).length;

  content = await applyPreConversionPlugins(content, options);

  const md = configureMarkdownParser();

  const outputPath = options.outputPath || `${path.parse(inputFile).name}.${options.outputFormat}`;
  let outputSize = 0;

  try {
    outputSize = await convertContent(content, options.outputFormat, outputPath, md, options);
  } catch (error) {
    throw new Error(`Conversion failed: ${(error as Error).message}`);
  }

  const result: ConversionResult = createConversionResult(outputPath, options, inputSize, outputSize, startTime);

  await applyPostConversionPlugins(result, options);

  return result;
}

async function validateInputFile(inputFile: string): Promise<void> {
  try {
    await fs.access(inputFile);
  } catch {
    throw new Error(`Input file not found: ${inputFile}`);
  }
}

async function readInputFile(inputFile: string): Promise<string> {
  return await fs.readFile(inputFile, 'utf-8');
}

async function applyPreConversionPlugins(content: string, options: ConversionOptions): Promise<string> {
  if (options.plugins) {
    try {
      content = await applyPluginsConcurrently(content, options.plugins, 'beforeConvert', options);
    } catch (error) {
      throw new Error(`Plugin error during pre-conversion: ${(error as Error).message}`);
    }
  }
  return content;
}

function configureMarkdownParser(): MarkdownIt {
  return new MarkdownIt({
    html: true,
    typographer: true,
    linkify: true
  })
    .use(anchor, { permalink: true })
    .use(toc, { includeLevel: [1, 2, 3] });
}

async function convertContent(
  content: string,
  outputFormat: string,
  outputPath: string,
  md: MarkdownIt,
  options: ConversionOptions
): Promise<number> {
  switch (outputFormat) {
    case 'html':
      return await convertToHtml(content, outputPath, md, options);
    case 'pdf':
      const htmlContent = md.render(content);
      return await convertToPdf(htmlContent, outputPath, options);
    case 'docx':
      return await convertToWord(content, outputPath, md);
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }
}

async function convertToHtml(
  content: string,
  outputPath: string,
  md: MarkdownIt,
  options: ConversionOptions
): Promise<number> {
  let cssContent = '';
  if (options.cssFile) {
    try {
      cssContent = await fs.readFile(options.cssFile, 'utf-8');
    } catch {
      console.warn(`Warning: CSS file not found: ${options.cssFile}`);
    }
  }

  const htmlContent = md.render(content);

  const fullHtml = createHtmlDocument(htmlContent, cssContent, outputPath);

  await fs.writeFile(outputPath, fullHtml);
  return Buffer.from(fullHtml).length;
}

function createHtmlDocument(htmlContent: string, cssContent: string, outputPath: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${path.parse(outputPath).name}</title>
      <style>
        ${cssContent || getDefaultCss()}
      </style>
    </head>
    <body>
      ${htmlContent}
      <footer>
        <hr>
        <small>Generated on ${new Date().toLocaleString()}</small>
      </footer>
    </body>
    </html>
  `;
}

async function convertToPdf(htmlContent: string, outputPath: string, options: ConversionOptions): Promise<number> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

  const pdfBuffer = await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' },
    printBackground: true
  });

  await browser.close();
  return pdfBuffer.length;
}

async function convertToWord(content: string, outputPath: string, md: MarkdownIt): Promise<number> {
  const tokens = md.parse(content, {});
  const doc = new Document({
    sections: [{
      properties: {
        type: SectionType.CONTINUOUS
      },
      children: []
    }],
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 24
          }
        }
      }
    }
  });

  const docElements = parseTokensToDocElements(tokens);

  // Update the first section with the document elements
  if (doc.sections[0]) {
    doc.sections[0].children = docElements;
  }

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
  return buffer.length;
}

function parseTokensToDocElements(tokens: any[]): Paragraph[] {
  const docElements: Paragraph[] = [];
  let currentList: Paragraph[] = [];
  let isInList = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading_open': {
        const level = parseInt(token.tag.slice(1));
        const headingText = tokens[i + 1].content;
        const headingType = `HEADING_${level}` as keyof typeof HeadingLevel;
        docElements.push(
          new Paragraph({
            text: headingText,
            heading: HeadingLevel[headingType],
            spacing: {
              before: 240,
              after: 120
            }
          })
        );
        i += 2;
        break;
      }

      case 'paragraph_open': {
        const text = tokens[i + 1].content;
        docElements.push(
          new Paragraph({
            text,
            spacing: {
              before: 120,
              after: 120
            }
          })
        );
        i += 2;
        break;
      }

      case 'bullet_list_open':
      case 'ordered_list_open':
        isInList = true;
        currentList = [];
        break;

      case 'bullet_list_close':
      case 'ordered_list_close':
        isInList = false;
        docElements.push(...currentList);
        currentList = [];
        break;

      case 'list_item_open':
        if (isInList) {
          const itemText = tokens[i + 2].content;
          currentList.push(
            new Paragraph({
              text: `• ${itemText}`,
              indent: {
                left: 720
              },
              spacing: {
                before: 60,
                after: 60
              }
            })
          );
        }
        break;
    }
  }

  return docElements;
}

function createConversionResult(
  outputPath: string,
  options: ConversionOptions,
  inputSize: number,
  outputSize: number,
  startTime: number
): ConversionResult {
  return {
    outputPath,
    success: true,
    format: options.outputFormat,
    metadata: options.metadata,
    stats: {
      inputSize,
      outputSize,
      processingTime: performance.now() - startTime
    }
  };
}

async function applyPostConversionPlugins(result: ConversionResult, options: ConversionOptions): Promise<void> {
  if (options.plugins) {
    try {
      await applyPluginsConcurrently(result, options.plugins, 'afterConvert');
    } catch (error) {
      throw new Error(`Plugin error during post-conversion: ${(error as Error).message}`);
    }
  }
}

async function applyPluginsConcurrently<T>(
  target: T,
  plugins: ConverterPlugin[],
  hook: 'beforeConvert' | 'afterConvert',
  options?: ConversionOptions
): Promise<T> {
  const applicablePlugins = plugins.filter(plugin => plugin[hook]);
  const pluginPromises = applicablePlugins.map(plugin => plugin[hook]!(target, options));
  const results = await Promise.all(pluginPromises);
  return results.reduce((acc, curr) => curr as T, target);
}

function getDefaultCss(): string {
  return `
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, system-ui, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background: #f4f4f4;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      overflow-x: auto;
      border-radius: 4px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f6f8fa;
    }
  `;
}
