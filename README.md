# Markdown Document Converter

This tool allows you to convert Markdown files to HTML, PDF, or Word documents using TypeScript. It supports plugin-based extensions and features robust logging using [Winston](https://github.com/winstonjs/winston).

## Features

- **Convert Markdown to Multiple Formats**: Convert Markdown files to **HTML**, **PDF**, or **Word (docx)**.
- **Logging**: All conversion processes are logged to the console and a log file.
- **Plugin Support**: Easily extend the conversion process with pre- and post-conversion plugins.
- **Custom Error Handling**: Custom error classes provide detailed information when something goes wrong, making debugging easier.

## Installation

First, clone the repository and install the dependencies:

```bash
npm install
```

## CLI Commands

You can also use the CLI to convert Markdown files without writing code. The CLI provides a simple way to specify the input file, output format, and additional options.

### Usage

```bash
mdconvert <inputFile> [options]
```

### Options

- `-f, --format <format>`: Specify the output format (`html`, `pdf`, `docx`).
- `-o, --output <outputPath>`: Specify the output file path.
- `-c, --css <cssFile>`: Path to a CSS file for styling HTML or PDF output.
- `-h, --help`: Display help for the CLI tool.

### Example

To convert `input.md` to a PDF:

```bash
mdconvert input.md -f pdf -o output/document.pdf
```

$1

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
  .then((result) => {
    console.log('Conversion succeeded:', result);
  })
  .catch((error) => {
    console.error('Conversion failed:', error);
  });
```

## Logging

This project uses [Winston](https://github.com/winstonjs/winston) for logging information during the conversion process.

- **Console Output**: Logs are displayed in the console.
- **File Logs**: All logs are saved in `logs/conversion.log`.
- **Log Levels**: The default log level is set to `info`. Errors, warnings, and informative messages are recorded to help diagnose issues.

Examples of log entries include:

```
2024-11-13T12:00:00 [ERROR]: FileReadError: Input file not found: input.md
2024-11-13T12:01:00 [INFO]: Conversion succeeded. Output saved at output/document.pdf
```

## Error Handling

The project defines custom error classes to handle various stages of the conversion process:

- **FileReadError**: Thrown when the input file cannot be found or read.
- **ConversionError**: Thrown when the conversion process encounters an issue.
- **PluginError**: Thrown when a plugin operation fails.

Example:

```typescript
import { FileReadError } from './dist/types';

try {
  // Some file operations
} catch (error) {
  if (error instanceof FileReadError) {
    console.error('File read failed:', error.message);
  }
}
```

## Plugins

You can extend the conversion process by adding plugins that can modify the content before and after conversion.

```typescript
const customPlugin: ConverterPlugin = {
  beforeConvert: async (content, options) => {
    // Modify content before conversion
    return content.replace(/foo/g, 'bar');
  },
  afterConvert: async (result) => {
    // Perform some action after conversion
    console.log('Post-conversion action:', result);
  }
};
```

### Plugin Hooks

- **beforeConvert(content, options)**: Modify the content before the conversion starts.
- **afterConvert(result)**: Perform actions after the conversion is complete.

## Example

To convert a Markdown file (`input.md`) to a PDF:

```typescript
import { convertMarkdown } from './dist/converter';

convertMarkdown('input.md', { outputFormat: 'pdf' })
  .then((result) => console.log('Conversion successful:', result))
  .catch((error) => console.error('Error during conversion:', error));
```

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. **Fork the repository**: Click the 'Fork' button at the top right of the GitHub page to create your own copy of the repository.
2. **Clone the forked repository**: Use the following command to clone the repository to your local machine:

   ```bash
   git clone https://github.com/brentmartinmiller/md-document-converter.git
   ```

3. **Create a new branch**: Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**: Implement your changes in the code.
5. **Commit your changes**: Commit your changes with a descriptive commit message:

   ```bash
   git commit -m "Add your commit message here"
   ```

6. **Push your changes**: Push your changes to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**: Go to the original repository on GitHub and create a Pull Request (PR) from your branch.

Please ensure your code follows the project's coding guidelines and is well-documented.

## License

This project is licensed under the MIT License.

