import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { useClient } from "../../common/useClient";
import RichTextEditor from "./components/RichTextEditor";
import useRichTextEditor from "./components/useRichTextEditor";

const TemplateEdit = () => {
  const { templateId } = useParams();
  const client = useClient();
  const { editor, isSaved } = useRichTextEditor({
    templateId: templateId ?? "",
  });
  const { data: template, isLoading } = useQuery({
    queryKey: [
      apiClient.NotificationModuleApi.mNotificationControllerFindOneTemplate
        .name,
      templateId,
    ],
    queryFn: () =>
      apiClient.NotificationModuleApi.mNotificationControllerFindOneTemplate(
        templateId ?? ""
      ),
  });

  useEffect(() => {
    if (template) {
      editor?.commands.setContent(JSON.parse(template.data.template));
    }
  }, [template, editor]);

  if (!editor || !client) return null;
  if (isLoading) return <CircularProgress />;
  return (
    <div>
      <p>{isSaved ? "save" : "saving"}</p>
      <RichTextEditor editor={editor} />
    </div>
  );
};

export default TemplateEdit;
