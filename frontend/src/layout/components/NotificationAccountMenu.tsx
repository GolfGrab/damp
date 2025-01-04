import { ManageAccounts, Tune } from "@mui/icons-material";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
} from "@mui/material";
import {
  AccountPopoverFooter,
  AccountPreview,
  SignOutButton,
} from "@toolpad/core";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  {
    title: "Account Settings",
    icon: <ManageAccounts />,
    to: "/notifications/accounts",
  },
  {
    title: "Preference Settings",
    icon: <Tune />,
    to: "/notifications/user-preferences",
  },
] as const;

const NotificationAccountMenu = () => {
  const navigate = useNavigate();
  return (
    <Stack direction="column">
      <AccountPreview variant="expanded" />
      <MenuList>
        {navigationItems.map((item) => (
          <MenuItem
            key={item.title}
            component="button"
            sx={{
              justifyContent: "flex-start",
              width: "100%",
            }}
            onClick={() => navigate(item.to)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
              }}
              primary={item.title}
            />
          </MenuItem>
        ))}
      </MenuList>
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
};

export default NotificationAccountMenu;
