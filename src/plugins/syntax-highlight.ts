import { ConverterPlugin } from '../types';
import { getHighlighter } from 'shiki';

export const syntaxHighlightPlugin: ConverterPlugin = {
  name: 'syntax-highlight',
  beforeConvert: async (content: string) => {
    const highlighter = await getHighlighter({
      theme: 'github-dark'
    });
    
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      try {
        return highlighter.codeToHtml(code, { lang: lang || 'text' });
      } catch {
        return code;
      }
    });
  }
};
