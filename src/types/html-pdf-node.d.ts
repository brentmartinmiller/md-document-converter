declare module 'html-pdf-node' {
    interface Options {
      format?: string;
      path?: string;
      margin?: { top?: number; right?: number; bottom?: number; left?: number };
      printBackground?: boolean;
      landscape?: boolean;
      scale?: number;
      timeout?: number;
    }
  
    interface File {
      content?: string;
      url?: string;
    }
  
    function generatePdf(file: File, options?: Options): Promise<Buffer>;
  
    export = { generatePdf };
  }