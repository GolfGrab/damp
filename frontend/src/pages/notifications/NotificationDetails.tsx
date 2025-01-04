import { Email, Sms } from "@mui/icons-material";
import { Avatar, Chip, Stack, SvgIcon, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import NotificationCenterGenericLayout from "../../layout/NotificationCenterGenericLayout";
import SlackLogo from "./components/SlackLogo.svg";

const NotificationDetails = () => {
  const { notificationId } = useParams();
  const applicationDetails = {
    id: notificationId,
    applicationName: "App1",
    title: "Title1",
    message: "Message1",
    createdTime: new Date(),
    image: "https://source.unsplash.com/random/300x300",
  };
  return (
    <NotificationCenterGenericLayout title="Notification Details">
      <Stack direction={"row"} gap={2}>
        <Avatar
          alt={applicationDetails.applicationName + " icon"}
          src={applicationDetails.image}
          sx={{ width: 64, height: 64 }}
        />
        <Stack direction={"column"}>
          <Typography variant="h6">{applicationDetails.title}</Typography>
          <Stack direction={"row"} gap={1}>
            <Chip label="Email" icon={<Email />} />
            <Chip label="SMS" icon={<Sms />} />
            <Chip
              label="Push"
              icon={<SvgIcon component={SlackLogo} inheritViewBox />}
            />
          </Stack>
        </Stack>
      </Stack>
    </NotificationCenterGenericLayout>
  );
};

export default NotificationDetails;
