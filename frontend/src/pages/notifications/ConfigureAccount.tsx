import { LinkOff } from "@mui/icons-material";
import { Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { AccountChannelTypeEnum } from "../../api/generated";
import { allChannels } from "./constants/allChannels";

const ConfigureAccount = () => {
  const { channelType } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const notifications = useNotifications();
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

  const { mutate: removeAccount } = useMutation({
    mutationKey: [apiClient.UserModuleApi.mUserControllerRemoveAccount.name],
    mutationFn: async () => {
      if (!auth.user?.profile.email || !channelType) {
        throw new Error("Invalid request");
      }

      await apiClient.UserModuleApi.mUserControllerRemoveAccount(
        auth.user!.profile.email!,
        channelType as AccountChannelTypeEnum
      );
    },
    onSuccess() {
      notifications.show("Account unlinked successfully", {
        severity: "success",
        autoHideDuration: 5000,
      });
      navigate("/notifications/accounts");
    },
  });

  const {
    mutate: updatePreferredToFalse,
    isPending: isUpdatePreferredToFalsePending,
  } = useMutation({
    mutationKey: [
      apiClient.UserModuleApi.mUserControllerUpdateManyUserPreferences.name,
    ],
    mutationFn: async () => {
      if (!auth.user?.profile.email || !channelType) {
        throw new Error("Invalid request");
      }

      await apiClient.UserModuleApi.mUserControllerUpdateManyUserPreferences(
        auth.user!.profile.email!,
        channelType as AccountChannelTypeEnum,
        {
          isPreferred: false,
        }
      );
    },
    onSuccess() {
      notifications.show(
        "Unsuscribed from all notifications from this channel successfully",
        {
          severity: "success",
          autoHideDuration: 5000,
        }
      );
    },
  });

  const userAccount = userAccounts?.find(
    (account) => account.channelType === channelType
  );

  if (!channelType || !userAccount || isUserAccountsLoading) {
    return (
      <Stack spacing={4}>
        {Object.values(allChannels).map((channel) => (
          <Skeleton key={channel.channelType} height={40} />
        ))}
      </Stack>
    );
  }

  if (isUserAccountsError) {
    return <Typography variant="body1">Error loading user accounts</Typography>;
  }

  const ChannelIcon = allChannels[channelType as keyof typeof allChannels].icon;

  return (
    <Stack spacing={2}>
      <Divider>
        <Stack spacing={2} direction="row" alignItems="center">
          <ChannelIcon color="primary" />
          <Typography variant="h6">{userAccount.channelToken}</Typography>
        </Stack>
      </Divider>
      <Button
        color="error"
        variant="outlined"
        endIcon={<LinkOff />}
        onClick={() => {
          removeAccount();
        }}
      >
        Unlink Account
      </Button>
      <Button
        color="error"
        variant="outlined"
        disabled={isUpdatePreferredToFalsePending}
        onClick={() => {
          updatePreferredToFalse();
        }}
      >
        Unsubscribe from all notifications
      </Button>
    </Stack>
  );
};

export default ConfigureAccount;
