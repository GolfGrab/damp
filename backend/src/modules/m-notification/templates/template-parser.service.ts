import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  AnyExtension,
  JSONContent,
  getSchema,
  generateText,
} from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Heading } from '@tiptap/extension-heading';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import {
  defaultMarkdownSerializer,
  MarkdownSerializerState,
  MarkdownSerializer as ProseMirrorMarkdownSerializer,
} from 'prosemirror-markdown';
import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import Link from '@tiptap/extension-link';

@Injectable()
export class TemplatesParserService {
  private readonly tiptapConfig: AnyExtension[];

  private readonly tiptapSchema: Schema;

  private readonly markdownSerializer: ProseMirrorMarkdownSerializer;

  constructor(private readonly prisma: PrismaService) {
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

    function renderHardBreak(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
      parent: ProseMirrorNode,
      index: number,
    ) {
      const br = '\n';
      for (let i = index + 1; i < parent.childCount; i += 1) {
        if (parent.child(i).type !== node.type) {
          state.write(br);
          return;
        }
      }
    }
    function renderCode(state: MarkdownSerializerState, node: ProseMirrorNode) {
      state.write('`');
      state.text(node.textContent, false);
      state.write('`');
    }
    function renderCodeBlock(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      state.write('```');
      state.ensureNewLine();
      state.text(node.textContent, false);
      state.ensureNewLine();
      state.write('```');
      state.closeBlock(node);
    }

    function renderListItem(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
      parent: ProseMirrorNode,
      index: number,
    ) {
      // For ordered lists, don't write the bullet "-" again.
      if (parent.type.name === 'bullet_list') {
        state.write('- '); // Bullet list marker
      } else if (parent.type.name === 'ordered_list') {
        const start = parent.attrs.order || 1;
        const nStr = String(start + index); // Use the order for ordered lists
        state.write(`${nStr}. `); // Ordered list marker like "1. "
      }

      state.renderInline(node); // Render the item content
      state.ensureNewLine(); // Ensure a new line after the list item
    }

    function renderOrderedList(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      console.log(JSON.stringify(node));
      const start = node.attrs.order || 1;
      const maxW = String(start + node.childCount - 1).length;
      state.renderList(node, '', (i) => {
        const nStr = String(start + i);
        return nStr + '. ';
      });
    }

    function renderBulletList(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      state.renderList(node, '', (i) => {
        return '- ';
      });
    }
    function renderDefaultInline(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      state.renderContent(node);
    }
    function renderDefaultBlock(
      state: MarkdownSerializerState,
      node: ProseMirrorNode,
    ) {
      state.renderContent(node);
      state.closeBlock(node);
    }

    const serializerNodes = {
      ...defaultMarkdownSerializer.nodes,
      [HardBreak.name]: renderHardBreak,
      [Code.name]: renderCode,
      [CodeBlock.name]: renderCodeBlock,
      [BulletList.name]: renderBulletList,
      [ListItem.name]: renderListItem,
      [OrderedList.name]: renderOrderedList,
      // Unsupported nodes
      [Heading.name]: renderDefaultBlock,
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
        open: (state, mark) => `[`,
        close: (state, mark) => `](${mark.attrs.href})`,
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
}
