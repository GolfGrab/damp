import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Color } from "@tiptap/extension-color";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { History } from "@tiptap/extension-history";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list-item";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Strike } from "@tiptap/extension-strike";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor as useTiptapEditor } from "@tiptap/react";
import { HeadingWithAnchor, LinkBubbleMenuHandler } from "mui-tiptap";

export default function useEditor() {
  const CustomLinkExtension = Link.extend({
    inclusive: false,
  });
  const extensions = [
    // Config editor
    Placeholder.configure({
      placeholder: "Add your own content here...",
    }),
    History,

    // common features
    Text,
    Paragraph,
    HeadingWithAnchor,
    Document,
    BulletList,
    ListItem,
    OrderedList,
    HardBreak,
    CustomLinkExtension.configure({
      autolink: true,
      linkOnPaste: true,
      openOnClick: false,
    }),
    LinkBubbleMenuHandler,

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
      types: ["heading", "paragraph", "image"],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
  ];
  return useTiptapEditor({
    extensions: extensions,
  });
}
