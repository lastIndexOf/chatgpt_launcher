import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

import 'highlight.js/styles/github.css';
import 'github-markdown-css';

class MarkdownRender {
  constructor(
    private _md = new MarkdownIt({
      highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (err) {
            console.error(err);
          }
        }

        return ''; // use external default escaping
      },
    })
  ) {}

  public render(text: string) {
    return this._md.render(text);
  }
}

export const mkRender = new MarkdownRender();
