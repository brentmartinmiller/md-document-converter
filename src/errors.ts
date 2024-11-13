export class FileReadError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'FileReadError';
    }
  }
  
  export class ConversionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConversionError';
    }
  }
  
  export class PluginError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PluginError';
    }
  }
  