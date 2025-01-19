import { Skeleton, styled } from "@mui/material";

const TemplatePreviewHtml = ({ content }: { content: string }) => {
  if (!content) {
    return (
      <>
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
      </>
    );
  }
  return (
    <NotificationMessageContainer
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
};

const NotificationMessageContainer = styled("div")({
  width: "100%",
  "& *": {
    overflowWrap: "break-word",
    whiteSpace: "normal",
  },
});

export default TemplatePreviewHtml;
