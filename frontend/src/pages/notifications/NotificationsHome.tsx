import { Typography } from "@mui/material";
import { useClient } from "../../common/useClient";
import NotificationList from "./components/NotificationList";

const NotificationsHome = () => {
  const { isClientLoaded } = useClient();

  if (!isClientLoaded) return null;
  return (
    <>
      <Typography variant="h6">Welcome!</Typography>
      <NotificationList />
    </>
  );
};

export default NotificationsHome;
