import { Button, Divider, Skeleton, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api";
import { allChannels } from "./constants/allChannels";

const Accounts = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const {
    data: userAccounts,
    isLoading: isUserAccountsLoading,
    isError: isUserAccountsError,
  } = useQuery({
    queryKey: [
      apiClient.UserModuleApi.mUserControllerFindAllUserAccountsByUserId.name,
    ],
    queryFn: async () => {
      if (!auth.user?.profile.email) {
        return [];
      }
      return await apiClient.UserModuleApi.mUserControllerFindAllUserAccountsByUserId(
        auth.user?.profile.email
      ).then((response) => response.data);
    },
  });

  const connectedChannels = Object.values(allChannels).filter((channel) =>
    userAccounts?.find(
      (account) =>
        account.channelType === channel.channelType &&
        account.verifiedAt != null
    )
  );

  const unconnectedChannels = Object.values(allChannels).filter(
    (channel) =>
      !userAccounts?.find(
        (account) =>
          account.channelType === channel.channelType &&
          account.verifiedAt != null
      )
  );

  if (isUserAccountsLoading) {
    return (
      <Stack spacing={4}>
        {Object.values(allChannels).map((channel) => (
          <Skeleton key={channel.channelType} height={40} />
        ))}
      </Stack>
    );
  }

  if (isUserAccountsError) {
    return <div>Error loading user accounts</div>;
  }

  return (
    <Stack spacing={4}>
      {connectedChannels.length > 0 && (
        <Stack spacing={2}>
          <Divider>Connected Accounts</Divider>
          {connectedChannels.map((channel) => (
            <Button
              key={channel.channelType}
              variant="outlined"
              startIcon={<channel.icon />}
              size="large"
              onClick={() =>
                navigate(
                  `/notifications/accounts/configure/${channel.channelType}`
                )
              }
            >
              Configure {channel.displayName} Account
            </Button>
          ))}
        </Stack>
      )}
      {unconnectedChannels.length > 0 && (
        <Stack spacing={2}>
          <Divider>Connect New Account</Divider>
          {unconnectedChannels.map((channel) => (
            <Button
              key={channel.channelType}
              variant="outlined"
              startIcon={<channel.icon />}
              size="large"
              onClick={() =>
                navigate(
                  `/notifications/accounts/connect/${channel.channelType}`
                )
              }
            >
              Connect {channel.displayName} Account
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default Accounts;
