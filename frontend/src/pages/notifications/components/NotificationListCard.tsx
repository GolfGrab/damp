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
  content: { applicationName, image, message, createdAt: createdTime, id },
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
        primary={message}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", display: "inline" }}
            >
              {applicationName + " — "}
            </Typography>
            {dayjs(createdTime).fromNow()}
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationListCard;
