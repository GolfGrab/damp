import { useClient } from "@/modules/common/hooks/useClient";
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
import { useEditor } from "@tiptap/react";
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHighlightColor,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonTextColor,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  MenuSelectTextAlign,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";

export default function RichTextEditor() {
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
  const editor = useEditor({
    extensions: extensions,
    content: "<p>Hello <b>world</b>!</p>",
  });
  const { isClientLoaded } = useClient();
  if (!isClientLoaded) return null;
  return (
    <RichTextEditorProvider editor={editor}>
      <RichTextField
        controls={
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonStrikethrough />
            <MenuDivider />
            <MenuButtonTextColor
              // defaultTextColor={theme.palette.text.primary}
              swatchColors={[
                { value: "#000000", label: "Black" },
                { value: "#ffffff", label: "White" },
                { value: "#888888", label: "Grey" },
                { value: "#ff0000", label: "Red" },
                { value: "#ff9900", label: "Orange" },
                { value: "#ffff00", label: "Yellow" },
                { value: "#00d000", label: "Green" },
                { value: "#0000ff", label: "Blue" },
              ]}
            />
            <MenuButtonHighlightColor
              swatchColors={[
                { value: "#595959", label: "Dark grey" },
                { value: "#dddddd", label: "Light grey" },
                { value: "#ffa6a6", label: "Light red" },
                { value: "#ffd699", label: "Light orange" },
                { value: "#ffff00", label: "Yellow" },
                { value: "#99cc99", label: "Light green" },
                { value: "#90c6ff", label: "Light blue" },
                { value: "#8085e9", label: "Light purple" },
              ]}
            />
            <MenuDivider />
            <MenuButtonEditLink />
            <MenuDivider />
            <MenuSelectTextAlign />
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuDivider />
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            <MenuDivider />
            <MenuButtonHorizontalRule />
            <MenuDivider />
            <MenuButtonRemoveFormatting />
            <MenuDivider />
            <MenuButtonUndo />
            <MenuButtonRedo />
            <LinkBubbleMenu />
          </MenuControlsContainer>
        }
      />
    </RichTextEditorProvider>
  );
}
