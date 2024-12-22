import { Divider, List, ListSubheader, Pagination } from "@mui/material";
import { groupBy, sortBy } from "lodash";
import NotificationListCard from "./NotificationListCard";
import { type NotificationPreviewContent } from "./types";

type NotificationListProps = {
  notifications: NotificationPreviewContent[];
};

const NotificationList = ({ notifications }: NotificationListProps) => {
  // Assume bff send notifications in date descending order
  const groupedNotifications = groupBy(notifications, (notification) =>
    notification.createdTime.toDateString()
  );
  const sortedGroupedNotifications = sortBy(
    Object.entries(groupedNotifications),
    ([date, _]) => new Date(date).getTime(),
    function ([_, notifications]) {
      return notifications;
    }
  );

  return (
    <>
      <List
        sx={{
          width: "100%",
          // maxWidth: 360,
          bgcolor: "background.paper",
          "& ul": { padding: 0, listStyleType: "none" },
        }}
        subheader={<li />}
      >
        {sortedGroupedNotifications.map(([date, notifications]) => (
          <>
            <li key={`section-${date}`}>
              <ul>
                <ListSubheader>{date}</ListSubheader>
                {notifications.map((notification, ind) => (
                  <>
                    <NotificationListCard
                      content={notification}
                      key={notification.id}
                    />
                    {ind !== notifications.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </>
                ))}
              </ul>
            </li>
          </>
        ))}
      </List>
      <Pagination count={10} />
    </>
  );
};

export default NotificationList;
