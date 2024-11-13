import fs from 'fs';
import path from 'path';
import showdown from 'showdown';
import pdf from 'html-pdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  LevelFormat,
  AlignmentType,
  IStylesOptions,
  UnderlineType,
  BorderStyle,
} from 'docx';
import { JSDOM } from 'jsdom';
import { ConversionOptions, ConverterPlugin } from './types';
import { FileReadError, ConversionError } from './errors';
import logger from './logger';

// Read default CSS from file
const defaultCssPath = path.join(__dirname, '../styles/default.css');
let defaultCss = '';
if (fs.existsSync(defaultCssPath)) {
  defaultCss = fs.readFileSync(defaultCssPath, 'utf-8');
}

export async function convertMarkdown(
  inputFile: string,
  options: ConversionOptions
): Promise<string> {
  try {
    logger.info(`Starting conversion of ${inputFile}`);

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      throw new FileReadError(`Input file not found: ${inputFile}`);
    }

    // Read input file content
    let content = fs.readFileSync(inputFile, 'utf-8');

    // Apply 'beforeConvert' plugins
    if (options.plugins) {
      for (const plugin of options.plugins) {
        if (plugin.beforeConvert) {
          content = await plugin.beforeConvert(content, options);
        }
      }
    }

    // Convert Markdown to HTML
    const converter = new showdown.Converter();
    let html = converter.makeHtml(content);

    // Apply CSS styling
    let cssContent = '';
    if (options.cssFile && fs.existsSync(options.cssFile)) {
      // Use the custom CSS file provided
      cssContent = fs.readFileSync(options.cssFile, 'utf-8');
    } else {
      // Use the default CSS styles
      cssContent = defaultCss;
    }
    html = `<style>${cssContent}</style>${html}`;

    // Set default output path if not provided
    const outputPath =
      options.outputPath ||
      path.join(process.cwd(), `output.${options.outputFormat}`);

    // Handle conversion based on output format
    switch (options.outputFormat) {
      case 'html':
        fs.writeFileSync(outputPath, html, 'utf-8');
        logger.info(`HTML file saved at ${outputPath}`);
        break;

      case 'pdf':
        await new Promise<void>((resolve, reject) => {
          pdf.create(html).toFile(outputPath, (err: Error | null, res) => {
            if (err) {
              reject(
                new ConversionError(`Failed to convert to PDF: ${err.message}`)
              );
            } else {
              logger.info(`PDF file saved at ${outputPath}`);
              resolve();
            }
          });
        });
        break;

      case 'docx':
        const dom = new JSDOM(html);
        const body = dom.window.document.body;

        const children: Paragraph[] = [];

        // Define styles matching the Modern theme
        const styles: IStylesOptions = {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                color: '000000',
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
          },
          paragraphStyles: [
            {
              id: 'Heading1',
              name: 'Heading 1',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 32, // 16pt
                bold: true,
                color: '2E74B5', // Modern theme color
                font: 'Calibri Light',
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: 'Heading2',
              name: 'Heading 2',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 28, // 14pt
                bold: true,
                color: '2E74B5',
                font: 'Calibri Light',
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: 'Heading3',
              name: 'Heading 3',
              basedOn: 'Normal',
              next: 'Normal',
              quickFormat: true,
              run: {
                size: 24, // 12pt
                bold: true,
                color: '1F4D78', // Slightly darker color
                font: 'Calibri Light',
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: 'Normal',
              name: 'Normal',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                color: '000000',
              },
            },
            {
              id: 'Code',
              name: 'Code',
              basedOn: 'Normal',
              run: {
                font: 'Consolas',
                size: 20, // 10pt
                color: '333333',
                shading: {
                  fill: 'EEEEEE', // Light gray background
                },
              },
              paragraph: {
                spacing: {
                  before: 120,
                  after: 120,
                },
                // 'shading' moved to 'run'
              },
            },
            {
              id: 'BlockQuote',
              name: 'Block Quote',
              basedOn: 'Normal',
              next: 'Normal',
              run: {
                italics: true,
                color: '666666',
              },
              paragraph: {
                indent: {
                  left: 720, // Indent by 0.5 inches
                },
                spacing: {
                  before: 120,
                  after: 120,
                },
                // 'border' will be applied directly to Paragraph instances
              },
            },
          ],
        };

        // Create a numbering instance for ordered lists
        const numbering = {
          config: [
            {
              reference: 'numbering-reference',
              levels: [
                {
                  level: 0,
                  format: LevelFormat.DECIMAL,
                  text: '%1.',
                  alignment: AlignmentType.LEFT,
                },
              ],
            },
          ],
        };

        body.childNodes.forEach((node) => {
          if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            let paragraph: Paragraph | undefined;

            switch (element.tagName.toLowerCase()) {
              case 'h1':
                paragraph = new Paragraph({
                  text: element.textContent || '',
                  style: 'Heading1',
                });
                break;
              case 'h2':
                paragraph = new Paragraph({
                  text: element.textContent || '',
                  style: 'Heading2',
                });
                break;
              case 'h3':
                paragraph = new Paragraph({
                  text: element.textContent || '',
                  style: 'Heading3',
                });
                break;
              case 'p':
                const runs: TextRun[] = [];
                element.childNodes.forEach((child) => {
                  if (child.nodeType === dom.window.Node.TEXT_NODE) {
                    runs.push(new TextRun(child.textContent || ''));
                  } else if (child.nodeType === dom.window.Node.ELEMENT_NODE) {
                    const childElement = child as HTMLElement;
                    let run: TextRun;

                    switch (childElement.tagName.toLowerCase()) {
                      case 'strong':
                      case 'b':
                        run = new TextRun({
                          text: childElement.textContent || '',
                          bold: true,
                        });
                        runs.push(run);
                        break;
                      case 'em':
                      case 'i':
                        run = new TextRun({
                          text: childElement.textContent || '',
                          italics: true,
                        });
                        runs.push(run);
                        break;
                      case 'u':
                        run = new TextRun({
                          text: childElement.textContent || '',
                          underline: {
                            type: UnderlineType.SINGLE,
                          },
                        });
                        runs.push(run);
                        break;
                      case 'code':
                        run = new TextRun({
                          text: childElement.textContent || '',
                          font: 'Consolas',
                          shading: {
                            fill: 'EEEEEE',
                          },
                        });
                        runs.push(run);
                        break;
                      case 'a':
                        run = new TextRun({
                          text: childElement.textContent || '',
                          color: '0563C1',
                          underline: {
                            type: UnderlineType.SINGLE,
                          },
                        });
                        runs.push(run);
                        break;
                      default:
                        runs.push(
                          new TextRun(childElement.textContent || '')
                        );
                        break;
                    }
                  }
                });

                paragraph = new Paragraph({
                  children: runs,
                  style: 'Normal',
                });
                break;
              case 'ul':
                element.querySelectorAll('li').forEach((li) => {
                  const listParagraph = new Paragraph({
                    text: li.textContent || '',
                    bullet: {
                      level: 0,
                    },
                    style: 'Normal',
                  });
                  children.push(listParagraph);
                });
                break;
              case 'ol':
                element.querySelectorAll('li').forEach((li) => {
                  const listParagraph = new Paragraph({
                    text: li.textContent || '',
                    numbering: {
                      reference: 'numbering-reference',
                      level: 0,
                    },
                    style: 'Normal',
                  });
                  children.push(listParagraph);
                });
                break;
              case 'blockquote':
                paragraph = new Paragraph({
                  children: [
                    new TextRun({
                      text: element.textContent || '',
                    }),
                  ],
                  style: 'BlockQuote',
                  border: {
                    left: {
                      color: '999999',
                      space: 1,
                      size: 6,
                      style: BorderStyle.SINGLE,
                    },
                  },
                });
                break;
              case 'pre':
                const codeText = element.textContent || '';
                const codeLines = codeText.split('\n');
                const codeRuns: TextRun[] = [];

                codeLines.forEach((line, index) => {
                  codeRuns.push(
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                    })
                  );
                  if (index < codeLines.length - 1) {
                    codeRuns.push(new TextRun({ break: 1 }));
                  }
                });

                paragraph = new Paragraph({
                  style: 'Code',
                  children: codeRuns,
                });
                break;
              default:
                paragraph = new Paragraph({
                  text: element.textContent || '',
                  style: 'Normal',
                });
                break;
            }

            if (paragraph) {
              children.push(paragraph);
            }
          }
        });

        // Create a new Document with the updated styles
        const doc = new Document({
          styles,
          numbering,
          sections: [
            {
              properties: {},
              children,
            },
          ],
        });

        // Generate the .docx file
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        logger.info(`DOCX file saved at ${outputPath}`);
        break;

      default:
        throw new ConversionError(
          `Unsupported output format: ${options.outputFormat}`
        );
    }

    // Apply 'afterConvert' plugins
    if (options.plugins) {
      for (const plugin of options.plugins) {
        if (plugin.afterConvert) {
          await plugin.afterConvert({ outputPath, options });
        }
      }
    }

    logger.info('Conversion process completed successfully.');
    return outputPath;
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}
