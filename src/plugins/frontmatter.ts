import matter from 'gray-matter';
import { ConverterPlugin, ConversionOptions } from '../types';

export const frontmatterPlugin: ConverterPlugin = {
  name: 'frontmatter',
  beforeConvert: async (content: string, options: ConversionOptions) => {
    const { data, content: markdown } = matter(content);
    options.metadata = { ...options.metadata, ...data };
    return markdown;
  }
};
