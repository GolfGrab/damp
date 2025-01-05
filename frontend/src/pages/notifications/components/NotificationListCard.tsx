import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
import { type NotificationPreviewContent } from "./types";

type NotificationListCardProps = {
  content: NotificationPreviewContent;
};

const NotificationListCard = ({
  content: { applicationName, image, createdAt, id, title },
}: NotificationListCardProps) => {
  dayjs.extend(relativeTime);
  const navigate = useNavigate();

  return (
    <ListItem
      alignItems="flex-start"
      onClick={() => {
        navigate(`/notifications/${id}`);
      }}
    >
      <ListItemAvatar>
        <Avatar alt={applicationName + "icon"} src={image} />
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", display: "inline" }}
            >
              {applicationName + " — "}
            </Typography>
            {dayjs(createdAt).fromNow()}
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationListCard;
