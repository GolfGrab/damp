import { OpenInNew } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("edit");
  const client = useClient();
  const { editor, isSaved, saveContent } = useRichTextEditor({
    templateId: templateId ?? "",
  });
  const {
    data: template,
    isLoading,
    isError: isTemplateError,
    refetch: refetchTemplate,
  } = useGetTemplate(templateId ?? "");
  const {
    mutate: getPreviewHtml,
    data: previewHtmlData,
    isPending: isPreviewHtmlPending,
    isError: isPreviewHtmlError,
  } = useGetTemplatePreview(
    templateId ?? "",
    MNotificationControllerPreviewTemplateMessageTypeEnum.Html
  );
  const {
    mutate: getPreviewSms,
    data: previewSmsData,
    isPending: isPreviewSmsPending,
    isError: isPreviewSmsError,
  } = useGetTemplatePreview(
    templateId ?? "",
    MNotificationControllerPreviewTemplateMessageTypeEnum.Text
  );
  const {
    mutate: getPreviewSlack,
    data: previewSlackData,
    isPending: isPreviewSlackPending,
    isError: isPreviewSlackError,
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

  if (isTemplateError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading template</Alert>
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => refetchTemplate()}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => navigate(0)}>
            Refresh This Page
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <div>
      <Box sx={{ width: "100%", typography: "body1" }}>
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
            {isPreviewHtmlPending && (
              <>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
              </>
            )}
            {isPreviewHtmlError && (
              <Stack spacing={4} width="100%">
                <Alert severity="error">Error loading HTML preview</Alert>
                <Stack spacing={2}>
                  <Button variant="outlined" onClick={() => navigate(0)}>
                    Refresh This Page
                  </Button>
                </Stack>
              </Stack>
            )}
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

            {isPreviewSmsError && (
              <Stack spacing={4} width="100%">
                <Alert severity="error">Error loading SMS preview</Alert>
                <Stack spacing={2}>
                  <Button variant="outlined" onClick={() => navigate(0)}>
                    Refresh This Page
                  </Button>
                </Stack>
              </Stack>
            )}

            {previewSmsData?.data}
          </TabPanel>
          <TabPanel value="p-slack">
            {isPreviewSlackPending && (
              <>
                <Skeleton animation="wave" />
              </>
            )}
            {isPreviewSlackError && (
              <Stack spacing={4} width="100%">
                <Alert severity="error">Error loading Slack preview</Alert>
                <Stack spacing={2}>
                  <Button variant="outlined" onClick={() => navigate(0)}>
                    Refresh This Page
                  </Button>
                </Stack>
              </Stack>
            )}

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
