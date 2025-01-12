import { useClient } from "../../common/useClient";
import RichTextEditor from "./components/RichTextEditor";
import useRichTextEditor from "./components/useRichTextEditor";

const TemplateEdit = () => {
  const { editor, isSaved } = useRichTextEditor();
  const client = useClient();

  if (!editor || !client) return null;
  return (
    <div>
      <p>{isSaved ? "save" : "saving"}</p>
      <RichTextEditor editor={editor} />
    </div>
  );
};

export default TemplateEdit;
