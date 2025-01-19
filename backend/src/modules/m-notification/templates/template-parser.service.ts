import { Injectable } from '@nestjs/common';
import { AnyExtension, JSONContent } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { generateHTML } from '@tiptap/html';
import htmlToMrkdwn from 'html-to-mrkdwn-ts';
import { convert } from 'html-to-text';

@Injectable()
export class TemplatesParserService {
  private readonly tiptapConfig: AnyExtension[];

  constructor() {
    this.tiptapConfig = [
      // common features
      Text,
      Paragraph,
      Heading,
      Document,
      BulletList,
      ListItem,
      OrderedList,
      HardBreak,
      Link,
      // Markdown, HTML features
      Bold,
      Italic,
      Strike,
      Code,
      CodeBlock,
      Blockquote,
      HorizontalRule,

      // HTML only features
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ];
  }

  parseJSONToHTML(json: JSONContent) {
    // Tiptap HTML will put <p></p> for empty paragraphs, we need to replace them with <br>
    return generateHTML(json, this.tiptapConfig).replace(/<p><\/p>/g, '<br>');
  }

  parseJSONToText(json: JSONContent) {
    const htmlString = this.parseJSONToHTML(json);
    return convert(htmlString, {
      selectors: [
        {
          selector: 'h1',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
        {
          selector: 'h2',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
        {
          selector: 'h3',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
        {
          selector: 'h4',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
        {
          selector: 'h5',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
        {
          selector: 'h6',
          options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
        },
      ],
    });
  }

  parseJSONToMarkdown(json: JSONContent) {
    const htmlString = this.parseJSONToHTML(json);
    return htmlToMrkdwn(htmlString, {
      strongDelimiter: '*',
      strikeDelimiter: '~',
      bulletMarker: '•',
    }).text;
  }

  parseJSONToCompiledTemplates(json: JSONContent) {
    try {
      return {
        HTML: this.parseJSONToHTML(json),
        MARKDOWN: this.parseJSONToMarkdown(json),
        TEXT: this.parseJSONToText(json),
      };
    } catch (e) {
      throw new Error('Failed to parse JSON to compiled templates: ' + e);
    }
  }
}
