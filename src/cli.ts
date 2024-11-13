#!/usr/bin/env node
import { Command } from 'commander';
import { convertMarkdown } from './converter';
import { ConversionOptions } from './types';

const program = new Command();

program
  .name('mdconvert')
  .description('Convert Markdown files to HTML, PDF, or Word documents.')
  .argument('<inputFile>', 'Path to the Markdown file')
  .option('-f, --format <format>', 'Output format (html, pdf, docx)', 'html')
  .option('-o, --output <outputPath>', 'Output file path')
  .option('-c, --css <cssFile>', 'Path to a CSS file for styling')
  .action(async (inputFile, options) => {
    const conversionOptions: ConversionOptions = {
      outputFormat: options.format,
      outputPath: options.output,
      cssFile: options.css,
    };

    try {
      const result = await convertMarkdown(inputFile, conversionOptions);
      console.log(`Conversion successful! Output saved at ${result}`);
    } catch (error) {
      console.error(`Conversion failed: ${(error as Error).message}`);
    }
  });

program.parse(process.argv);
