import {
  Checkbox,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { UserPreferenceChannelTypeEnum } from "../../api/generated";
import { allChannels } from "./constants/allChannels";

const NotificationApplicationUserPreferences = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { applicationId } = useParams();

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

  const { data: userPreferences, isError: isUserPreferencesError } = useQuery({
    queryKey: [
      apiClient.UserModuleApi.mUserControllerFindAllUserPreferencesByUserId
        .name,
    ],
    queryFn: async () => {
      if (!auth.user?.profile.email) {
        return [];
      }
      return await apiClient.UserModuleApi.mUserControllerFindAllUserPreferencesByUserId(
        auth.user?.profile.email
      ).then((response) => response.data);
    },
  });

  const {
    data: notificationCategories,
    isLoading: isNotificationCategoriesLoading,
    isError: isNotificationCategoriesError,
  } = useQuery({
    queryKey: [
      apiClient.ApplicationModuleApi
        .mApplicationControllerFindAllNotificationCategoriesByApplicationId
        .name,
    ],
    queryFn: async () => {
      return await apiClient.ApplicationModuleApi.mApplicationControllerFindAllNotificationCategoriesByApplicationId(
        applicationId as string
      ).then((response) => response.data);
    },
  });

  const { mutate: upsertUserPreference } = useMutation({
    mutationKey: [
      apiClient.UserModuleApi.mUserControllerUpsertUserPreference.name,
    ],
    mutationFn: async ({
      channelType,
      notificationCategoryId,
      isPreferred,
    }: {
      channelType: string;
      notificationCategoryId: string;
      isPreferred: boolean;
    }) => {
      await apiClient.UserModuleApi.mUserControllerUpsertUserPreference(
        auth.user!.profile.email!,
        channelType as UserPreferenceChannelTypeEnum,
        notificationCategoryId,
        {
          isPreferred,
        }
      );
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [
          apiClient.UserModuleApi.mUserControllerFindAllUserPreferencesByUserId
            .name,
        ],
      });
    },
  });

  if (
    isUserAccountsLoading ||
    isNotificationCategoriesLoading ||
    !userAccounts ||
    !userPreferences ||
    !notificationCategories
  ) {
    return (
      <Stack spacing={4}>
        <Skeleton height={40} />
        <Skeleton height={400} variant="rectangular" />
      </Stack>
    );
  }

  if (
    isUserAccountsError ||
    isUserPreferencesError ||
    isNotificationCategoriesError
  ) {
    return <div>Error loading user preferences</div>;
  }

  const channelsWithVerifiedAccountStatus = Object.values(allChannels).map(
    (channel) => ({
      ...channel,
      hasVerifiedAccount: !!userAccounts.find(
        (account) =>
          account.channelType === channel.channelType &&
          account.verifiedAt != null
      ),
    })
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="body1">
          enable or disable notifications for each channel of {applicationId}
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ maxWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Notification Category</TableCell>
                {Object.values(allChannels).map((channel) => (
                  <TableCell key={channel.channelType}>
                    {channel.displayName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {notificationCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell component="th" scope="row">
                    {category.name}
                  </TableCell>
                  {channelsWithVerifiedAccountStatus.map((channel) => (
                    <TableCell
                      key={channel.channelType}
                      sx={{
                        px: 1,
                      }}
                    >
                      <Checkbox
                        checked={
                          userPreferences.find(
                            (preference) =>
                              preference.notificationCategoryId ===
                                category.id &&
                              preference.channelType === channel.channelType
                          )?.isPreferred && channel.hasVerifiedAccount
                        }
                        indeterminate={!channel.hasVerifiedAccount}
                        disabled={!channel.hasVerifiedAccount}
                        onChange={(e) =>
                          upsertUserPreference({
                            channelType: channel.channelType,
                            notificationCategoryId: category.id,
                            isPreferred: e.target.checked,
                          })
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
};

export default NotificationApplicationUserPreferences;
