import { convertMarkdown } from './converter';
import { ConversionOptions } from './types';

const options: ConversionOptions = {
  outputFormat: 'pdf',
  outputPath: 'output/document.pdf',
  metadata: {
    title: 'Converted Document',
    author: 'John Doe',
  },
  cssFile: 'styles/custom.css',
  plugins: [
    {
      beforeConvert: async (content) => {
        return content.replace(/foo/g, 'bar');
      },
    },
  ],
};

convertMarkdown('input.md', options)
  .then((result) => {
    console.log('Conversion succeeded:', result);
  })
  .catch((error) => {
    console.error('Conversion failed:', error);
  });
