# Markdown Document Converter

A TypeScript-based tool for converting Markdown files to HTML, PDF, or Word documents. Features plugin-based extensions and comprehensive logging via [Winston](https://github.com/winstonjs/winston).

## Features

- **Multi-Format Conversion**: Transform Markdown files to HTML, PDF, or Word (docx)
- **Comprehensive Logging**: Track all operations via console and file logging
- **Plugin Architecture**: Extend functionality with pre- and post-conversion plugins
- **Robust Error Handling**: Detailed error reporting for efficient debugging

## Installation

Install via npm:
```bash
npm install -g md-document-converter
```

Or clone and install manually:
```bash
git clone https://github.com/yourusername/md-document-converter.git
cd md-document-converter
npm install
```

## CLI Usage

Convert documents using the command-line interface:

```bash
mdconvert <inputFile> [options]
```

### Options

- `-f, --format <format>`: Output format (html, pdf, docx)
- `-o, --output <outputPath>`: Output file path
- `-c, --css <cssFile>`: CSS file for HTML/PDF styling
- `-h, --help`: Display help information

### Example

Convert to PDF:
```bash
mdconvert input.md -f pdf -o output/document.pdf
```

## Programmatic Usage

```typescript
import { convertMarkdown } from './dist/converter';
import { ConversionOptions } from './dist/types';

const options: ConversionOptions = {
  outputFormat: 'pdf',
  outputPath: 'output/document.pdf',
  metadata: {
    title: 'Converted Document',
    author: 'John Doe'
  },
  cssFile: 'styles/custom.css',
  plugins: [
    {
      beforeConvert: async (content) => {
        return content.replace(/foo/g, 'bar');
      }
    }
  ]
};

convertMarkdown('input.md', options)
  .then((result) => console.log('Conversion succeeded:', result))
  .catch((error) => console.error('Conversion failed:', error));
```

## Logging

The project utilizes [Winston](https://github.com/winstonjs/winston) for comprehensive logging:

- **Console Output**: Real-time logging in the terminal
- **File Logging**: Persistent logs stored in `logs/conversion.log`
- **Log Levels**: Configurable levels for errors, warnings, and info messages

Example log entries:
```
2024-11-13T12:00:00 [ERROR]: FileReadError: Input file not found: input.md
2024-11-13T12:01:00 [INFO]: Conversion succeeded. Output saved at output/document.pdf
```

## Error Handling

Custom error classes provide detailed error information:

- `FileReadError`: File access and reading issues
- `ConversionError`: Conversion process failures
- `PluginError`: Plugin execution problems

Example usage:
```typescript
import { FileReadError } from './dist/types';

try {
  // File operations
} catch (error) {
  if (error instanceof FileReadError) {
    console.error('File read failed:', error.message);
  }
}
```

## Plugin System

Extend functionality with custom plugins:

```typescript
const customPlugin: ConverterPlugin = {
  beforeConvert: async (content, options) => {
    return content.replace(/foo/g, 'bar');
  },
  afterConvert: async (result) => {
    console.log('Post-conversion action:', result);
  }
};
```

### Plugin Hooks

- `beforeConvert(content, options)`: Pre-conversion content modification
- `afterConvert(result)`: Post-conversion processing

## Quick Start

Convert a Markdown file to PDF:
```typescript
import { convertMarkdown } from './dist/converter';

convertMarkdown('input.md', { outputFormat: 'pdf' })
  .then((result) => console.log('Conversion successful:', result))
  .catch((error) => console.error('Error during conversion:', error));
```

## Contributing

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/yourusername/md-document-converter.git
```
3. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```
4. Make your changes
5. Commit changes:
```bash
git commit -m "Add your commit message here"
```
6. Push to your fork:
```bash
git push origin feature/your-feature-name
```
7. Open a Pull Request

Please ensure your code follows our style guidelines and includes appropriate documentation.

## License

MIT License