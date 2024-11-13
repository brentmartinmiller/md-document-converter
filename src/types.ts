import winston from 'winston';

export interface ConversionOptions {
  /**
   * The output format for the conversion. Can be 'html', 'pdf', or 'docx'.
   */
  outputFormat: 'html' | 'pdf' | 'docx';

  /**
   * Optional path to specify where the output file should be saved. If not provided, the default path will be derived from the input file name.
   */
  outputPath?: string;

  /**
   * Optional metadata to include with the conversion result, such as additional information about the conversion.
   */
  metadata?: Record<string, any>;

  /**
   * Optional CSS file path to customize the style of HTML or PDF output.
   */
  cssFile?: string;

  /**
   * List of plugins to apply during the conversion process. These can modify the content before or after the conversion.
   */
  plugins?: ConverterPlugin[];
}

export interface ConversionResult {
  /**
   * The path where the converted output file is saved.
   */
  outputPath: string;

  /**
   * A flag indicating whether the conversion was successful.
   */
  success: boolean;

  /**
   * The format of the output file.
   */
  format: 'html' | 'pdf' | 'docx';

  /**
   * Optional metadata included with the conversion result.
   */
  metadata?: Record<string, any>;

  /**
   * Statistics about the conversion process, including input size, output size, and processing time.
   */
  stats: {
    /**
     * Size of the input content in bytes.
     */
    inputSize: number;

    /**
     * Size of the output content in bytes.
     */
    outputSize: number;

    /**
     * Time taken to process the conversion in milliseconds.
     */
    processingTime: number;
  };
}

export interface ConverterPlugin {
  /**
   * A function to modify the content before conversion. This is useful for preprocessing content, such as replacing certain tokens or applying transformations.
   * @param content - The original content to be converted.
   * @param options - The conversion options.
   * @returns The modified content.
   */
  beforeConvert?: (content: string, options: ConversionOptions) => Promise<string> | string;

  /**
   * A function to modify the conversion result after conversion is complete. This is useful for post-processing tasks, such as adding metadata or modifying output paths.
   * @param result - The result of the conversion.
   */
  afterConvert?: (result: ConversionResult) => Promise<void> | void;
}

/**
 * Custom error class for handling file read errors.
 */
export class FileReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileReadError';
    logger.error(`FileReadError: ${message}`);
  }
}

/**
 * Custom error class for handling conversion errors.
 */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
    logger.error(`ConversionError: ${message}`);
  }
}

/**
 * Custom error class for handling plugin-related errors.
 */
export class PluginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluginError';
    logger.error(`PluginError: ${message}`);
  }
}

// Winston logger configuration
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/conversion.log' })
  ]
});
