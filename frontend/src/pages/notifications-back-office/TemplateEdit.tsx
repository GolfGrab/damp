import { ContentCopy, OpenInNew } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import {
  GetPreviewTemplateDto,
  MNotificationControllerPreviewTemplateMessageTypeEnum,
} from "../../api/generated";
import { useClient } from "../../common/useClient";
import RichTextEditor from "./components/RichTextEditor";
import TemplatePreviewHtml from "./components/TemplatePreviewHtml";
import useRichTextEditor from "./components/useRichTextEditor";

const useGetTemplate = (templateId: string) =>
  useQuery({
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

const useGetTemplatePreview = (
  templateId: string,
  messageType: MNotificationControllerPreviewTemplateMessageTypeEnum
) =>
  useMutation({
    mutationKey: [
      apiClient.NotificationModuleApi.mNotificationControllerPreviewTemplate
        .name,
      templateId,
      messageType,
    ],
    mutationFn: ({
      getPreviewTemplateDto,
    }: {
      getPreviewTemplateDto: GetPreviewTemplateDto;
    }) =>
      apiClient.NotificationModuleApi.mNotificationControllerPreviewTemplate(
        templateId,
        messageType,
        getPreviewTemplateDto
      ),
  });

const TemplateEdit = () => {
  const { templateId } = useParams();
  const [currentTab, setCurrentTab] = useState("edit");
  const client = useClient();
  const notifications = useNotifications();
  const { editor, isSaved, saveContent } = useRichTextEditor({
    templateId: templateId ?? "",
  });
  const { data: template, isLoading } = useGetTemplate(templateId ?? "");
  const { mutate: getPreviewHtml, data: previewHtmlData } =
    useGetTemplatePreview(
      templateId ?? "",
      MNotificationControllerPreviewTemplateMessageTypeEnum.Html
    );
  const {
    mutate: getPreviewSms,
    data: previewSmsData,
    isPending: isPreviewSmsPending,
  } = useGetTemplatePreview(
    templateId ?? "",
    MNotificationControllerPreviewTemplateMessageTypeEnum.Text
  );
  const {
    mutate: getPreviewSlack,
    data: previewSlackData,
    isPending: isPreviewSlackPending,
  } = useGetTemplatePreview(
    templateId ?? "",
    MNotificationControllerPreviewTemplateMessageTypeEnum.Markdown
  );
  const baseSlackPreview = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: previewSlackData?.data ?? "",
        },
      },
    ],
  };
  const uriEncodedSlackPreview = encodeURI(JSON.stringify(baseSlackPreview));

  useEffect(() => {
    if (template) {
      editor?.commands.setContent(JSON.parse(template.data.template));
    }
  }, [template, editor]);

  if (!editor || !client) return null;
  if (isLoading) return <CircularProgress />;
  return (
    <div>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4">Template: {template?.data.id}</Typography>
          <Tooltip title="Copy To Clipboard" arrow>
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(template?.data.id || "");
                notifications.show("Template ID copied to clipboard", {
                  severity: "success",
                  autoHideDuration: 2000,
                });
              }}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Stack>
        <TabContext value={currentTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={(_, v) => {
                saveContent(editor.getJSON());
                setCurrentTab(v);
              }}
            >
              <Tab label="Edit" value="edit" />
              <Tab
                label="Preview email"
                value="p-email"
                onClick={() => {
                  getPreviewHtml({
                    getPreviewTemplateDto: {
                      data: {},
                    },
                  });
                }}
              />
              <Tab
                label="Preview SMS"
                value="p-sms"
                onClick={() => {
                  getPreviewSms({
                    getPreviewTemplateDto: {
                      data: {},
                    },
                  });
                }}
              />
              <Tab
                label="Preview slack"
                value="p-slack"
                onClick={() => {
                  getPreviewSlack({
                    getPreviewTemplateDto: {
                      data: {},
                    },
                  });
                }}
              />
            </TabList>
          </Box>
          <TabPanel value="edit">
            <RichTextEditor editor={editor} isSaved={isSaved} />
          </TabPanel>
          <TabPanel value="p-email">
            <TemplatePreviewHtml content={previewHtmlData?.data ?? ""} />
          </TabPanel>
          <TabPanel
            value="p-sms"
            sx={{
              // Wrap \n in content
              whiteSpace: "pre-wrap",
            }}
          >
            {isPreviewSmsPending && (
              <>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
              </>
            )}
            {previewSmsData?.data}
          </TabPanel>
          <TabPanel value="p-slack">
            <LoadingButton
              href={`https://app.slack.com/block-kit-builder#${uriEncodedSlackPreview}`}
              target="_blank"
              loading={isPreviewSlackPending}
              disabled={isPreviewSlackPending}
              endIcon={<OpenInNew />}
              variant="contained"
            >
              Preview in Slack Block Kit Builder
            </LoadingButton>
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  );
};

export default TemplateEdit;
