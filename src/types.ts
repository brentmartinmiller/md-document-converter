export interface ConversionOptions {
  /**
   * The output format of the conversion.
   * Supported formats: 'html', 'pdf', 'docx'.
   */
  outputFormat: 'html' | 'pdf' | 'docx';

  /**
   * The path where the output file will be saved.
   * If not provided, a default path will be used.
   */
  outputPath?: string;

  /**
   * The path to a CSS file for styling HTML and PDF outputs.
   * If not provided, default styles will be applied.
   */
  cssFile?: string;

  /**
   * An array of plugins that can modify the content before and after conversion.
   */
  plugins?: ConverterPlugin[];
}

export interface ConverterPlugin {
  /**
   * A function that modifies the content before conversion.
   * @param content - The original Markdown content.
   * @param options - The conversion options.
   * @returns The modified content.
   */
  beforeConvert?: (
    content: string,
    options: ConversionOptions
  ) => Promise<string> | string;

  /**
   * A function that is called after conversion is complete.
   * Can be used for post-processing tasks.
   * @param context - An object containing the output path and options.
   */
  afterConvert?: (context: {
    outputPath: string;
    options: ConversionOptions;
  }) => Promise<void> | void;
}
