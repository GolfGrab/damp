import { Typography } from "@mui/material";
import { useClient } from "../../common/useClient";
import NotificationCenterHomeLayout from "../../layout/NotificationCenterHomeLayout";
import NotificationList from "./components/NotificationList";

const NotificationsHome = () => {
  const { isClientLoaded } = useClient();

  if (!isClientLoaded) return null;
  return (
    <NotificationCenterHomeLayout>
      <Typography variant="h6">Welcome!</Typography>
      <NotificationList />
    </NotificationCenterHomeLayout>
  );
};

export default NotificationsHome;
