import { Alert, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDialogs } from "@toolpad/core";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { AccountChannelTypeEnum } from "../../api/generated";

const VerifyAccount = () => {
  const { channelType } = useParams();
  const auth = useAuth();
  const [otpCode, setOtpCode] = useState<string>("");
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const {
    data: userAccounts,
    isLoading: isUserAccountsLoading,
    isError: isUserAccountsError,
    refetch: refetchUserAccounts,
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

  const userAccount = userAccounts?.find(
    (account) => account.channelType === channelType
  );

  const { mutate: createNewOtp, isPending: isCreateNewOtpPending } =
    useMutation({
      mutationKey: [apiClient.UserModuleApi.mUserControllerCreateNewOtp.name],
      mutationFn: async () => {
        if (!auth.user?.profile.email || !channelType || !userAccount) {
          throw new Error("Invalid request");
        }

        await apiClient.UserModuleApi.mUserControllerCreateNewOtp(
          auth.user!.profile.email!,
          channelType as AccountChannelTypeEnum
        );
      },
      onSuccess() {
        dialogs.alert("OTP sent successfully", {
          okText: "OK",
        });
      },
      onError() {
        dialogs.alert(
          "An error occurred while sending new OTP, please try again",
          {
            okText: "OK",
          }
        );
      },
    });

  const { mutate: verifyAccount, isPending: isVerifyAccountPending } =
    useMutation({
      mutationKey: [apiClient.UserModuleApi.mUserControllerVerifyAccount.name],
      mutationFn: async () =>
        await apiClient.UserModuleApi.mUserControllerVerifyAccount(
          auth.user!.profile.email!,
          channelType as AccountChannelTypeEnum,
          {
            otpCode,
          }
        ).catch((error) => {
          setOtpCode("");
          throw new Error(error.response.data.message);
        }),
      onSuccess() {
        navigate(`/notifications/accounts`);
      },
      async onError(error) {
        setOtpCode("");
        await dialogs.alert("Error: " + error.message, {
          okText: "OK",
        });
      },
    });

  if (isUserAccountsLoading) {
    return (
      <Stack spacing={4} width="100%">
        <Skeleton height={40} />
        <Skeleton height={40} />
      </Stack>
    );
  }

  if (isUserAccountsError) {
    return (
      <Stack spacing={4} width="100%">
        <Alert severity="error">Error loading user account</Alert>
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => refetchUserAccounts()}>
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => navigate(0)}>
            Refresh This Page
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Last Step To Verify Your Account</Typography>
        <Typography variant="body1">
          We have sent a verification code to {userAccount?.channelToken}.
          Please enter the code below to verify your account.
        </Typography>
      </Stack>
      <MuiOtpInput value={otpCode} onChange={(v) => setOtpCode(v)} length={6} />

      <Button
        variant="contained"
        color="primary"
        onClick={() => verifyAccount()}
        disabled={!(otpCode?.length === 6) || isVerifyAccountPending}
      >
        Verify
      </Button>
      <Stack alignItems="center" justifyContent="center">
        <Typography variant="body2">Didn't receive the code?</Typography>
        <Button
          onClick={() => {
            if (!isCreateNewOtpPending && !isVerifyAccountPending) {
              createNewOtp();
            }
          }}
        >
          {isCreateNewOtpPending ? "Sending OTP..." : "Send OTP Again"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default VerifyAccount;
