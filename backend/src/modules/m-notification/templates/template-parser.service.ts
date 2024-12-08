import { Injectable } from '@nestjs/common';
import {
  AnyExtension,
  generateText,
  getSchema,
  JSONContent,
} from '@tiptap/core';
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
import {
  defaultMarkdownSerializer,
  MarkdownSerializer as ProseMirrorMarkdownSerializer,
} from 'prosemirror-markdown';
import { Mark, Schema } from 'prosemirror-model';
import * as templateParserUtils from './template-parser.utils';

@Injectable()
export class TemplatesParserService {
  private readonly tiptapConfig: AnyExtension[];

  private readonly tiptapSchema: Schema;

  private readonly markdownSerializer: ProseMirrorMarkdownSerializer;

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

    this.tiptapSchema = getSchema(this.tiptapConfig);

    const serializerNodes = {
      ...defaultMarkdownSerializer.nodes,
      [HardBreak.name]: templateParserUtils.renderHardBreak,
      [Code.name]: templateParserUtils.renderCode,
      [CodeBlock.name]: templateParserUtils.renderCodeBlock,
      [BulletList.name]: templateParserUtils.renderBulletList,
      [ListItem.name]: templateParserUtils.renderListItem,
      [OrderedList.name]: templateParserUtils.renderOrderedList,
      // Unsupported nodes
      [Heading.name]: templateParserUtils.renderDefaultBlock,
    };
    const serializerMarks = {
      ...defaultMarkdownSerializer.marks,
      [Strike.name]: {
        open: '~',
        close: '~',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      [Bold.name]: {
        open: '*',
        close: '*',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      [Italic.name]: {
        open: '_',
        close: '_',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      [Link.name]: {
        open: () => '[',
        close: (_state, mark: Mark) => `](${mark.attrs.href ?? ''})`,
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      // Unsupported marks
      [TextStyle.name]: {
        open: '',
        close: '',
      },
      [Highlight.name]: {
        open: '',
        close: '',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
    };
    this.markdownSerializer = new ProseMirrorMarkdownSerializer(
      serializerNodes,
      serializerMarks,
    );
  }

  parseJSONToHTML(json: JSONContent) {
    return generateHTML(json, this.tiptapConfig);
  }

  parseJSONToText(json: JSONContent) {
    return generateText(json, this.tiptapConfig);
  }

  parseJSONToMarkdown(json: JSONContent) {
    const proseMirrorDocument = this.tiptapSchema.nodeFromJSON(json);
    return this.markdownSerializer.serialize(proseMirrorDocument, {
      tightLists: true,
    });
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
