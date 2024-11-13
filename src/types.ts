export interface ConversionOptions {
    outputFormat: 'html' | 'pdf' | 'docx';
    outputPath?: string;
    cssFile?: string;
    metadata?: {
      title?: string;
      author?: string;
    };
    plugins?: ConverterPlugin[];
  }
  
  export interface ConverterPlugin {
    beforeConvert?: (content: string, options: ConversionOptions) => Promise<string> | string;
    afterConvert?: (result: { outputPath: string; options: ConversionOptions }) => Promise<void> | void;
  }
  