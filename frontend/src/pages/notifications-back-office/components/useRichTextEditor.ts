import { useMutation } from "@tanstack/react-query";
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
import { Editor, useEditor as useTiptapEditor } from "@tiptap/react";
import { HeadingWithAnchor, LinkBubbleMenuHandler } from "mui-tiptap";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "../../../api";

const debounceTime = 2000;
const maxTime = 10000;

const useUpdateTemplateMutation = () =>
  useMutation({
    mutationFn: ({
      templateId,
      content,
    }: {
      templateId: string;
      content: object;
    }) =>
      apiClient.NotificationModuleApi.mNotificationControllerUpdateTemplate(
        templateId,
        {
          template: content,
        }
      ),
  });

export default function useRichTextEditor({
  templateId,
}: {
  templateId: string;
}) {
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [content, setContent] = useState<object>({});
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const maxTimer = useRef<NodeJS.Timeout | null>(null);
  const { mutate, error, isPending } = useUpdateTemplateMutation();

  const saveContent = (content: object) => {
    console.log("Content saved:", JSON.stringify(content));
    // Your API call or save logic goes here
    mutate({ templateId, content });
    setIsSaved(true);
  };

  const handleContentChange = (editor: Editor) => {
    const currentContent = editor.getJSON();
    setContent(currentContent);
    setIsSaved(false);

    // Set new debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      saveContent(currentContent);
    }, debounceTime);

    // Set up a max timer if it's not already set
    if (!maxTimer.current) {
      maxTimer.current = setTimeout(() => {
        saveContent(currentContent);
        // Clear debounce timer if max timer triggers
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
          debounceTimer.current = null;
        }
      }, maxTime);
    }
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message =
        "You have unsaved changes. Please wait a moment before leaving the page.";
      if (!isSaved) {
        event.preventDefault();
        event.returnValue = message; // Standard for most browsers
        return message; // Fallback for older browsers
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSaved]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (maxTimer.current) {
        clearTimeout(maxTimer.current);
      }
    };
  }, []);

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
    Paragraph.extend({
      renderHTML({ HTMLAttributes }) {
        return [
          "p",
          {
            ...HTMLAttributes,
            style: "margin-block: 1em;" + HTMLAttributes.style,
          },
          0,
        ];
      },
    }),
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
  return {
    editor: useTiptapEditor({
      extensions: extensions,
      onUpdate: ({ editor }) => {
        handleContentChange(editor);
      },
    }),
    isSaved,
    content,
    error,
    isPending,
    saveContent,
  };
}
