import { Button, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { MuiTelInput } from "mui-tel-input";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api";
import { AccountChannelTypeEnum } from "../../api/generated";

const ConnectAccount = () => {
  const { channelType } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();

  const [channelToken, setChannelToken] = useState<string>("");
  const [channelTokenError, setChannelTokenError] = useState<string>();

  const { mutate: upsertAccount, isPending: isUpsertAccountPending } =
    useMutation({
      mutationKey: [apiClient.UserModuleApi.mUserControllerUpsertAccount.name],
      mutationFn: async () =>
        await apiClient.UserModuleApi.mUserControllerUpsertAccount(
          auth.user!.profile.email!,
          channelType as AccountChannelTypeEnum,
          {
            channelToken,
          }
        ),
      onSuccess() {
        navigate(`/notifications/accounts/verify/${channelType}`);
      },
    });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+[0-9]{1,3}[0-9\s]{1,14}$/;

  const handleChannelTokenChange = (value: string) => {
    if (channelType === AccountChannelTypeEnum.Email) {
      if (!emailRegex.test(value)) {
        setChannelTokenError("Invalid email");
      } else {
        setChannelTokenError(undefined);
      }
    } else if (channelType === AccountChannelTypeEnum.Sms) {
      if (!phoneRegex.test(value)) {
        setChannelTokenError("Invalid phone number");
      } else {
        setChannelTokenError(undefined);
      }
    } else if (channelType === AccountChannelTypeEnum.Slack) {
      if (value.length === 0) {
        setChannelTokenError("Slack ID cannot be empty");
      } else {
        setChannelTokenError(undefined);
      }
    }

    setChannelToken(value);
  };

  if (
    !channelType ||
    Object.values(AccountChannelTypeEnum).every((type) => type !== channelType)
  ) {
    return "Invalid channel type";
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">Hi {auth.user?.profile.email}!</Typography>
        <Typography variant="body1">
          Please input your{" "}
          {channelType === AccountChannelTypeEnum.Email
            ? "email"
            : channelType === AccountChannelTypeEnum.Sms
              ? "phone number"
              : channelType === AccountChannelTypeEnum.Slack
                ? "Slack ID"
                : ""}{" "}
          to connect with notification service.
        </Typography>
      </Stack>
      {channelType === AccountChannelTypeEnum.Email ? (
        <TextField
          required
          label="Email"
          value={channelToken}
          onChange={(e) => handleChannelTokenChange(e.target.value)}
          error={!!channelTokenError}
          helperText={channelTokenError}
        />
      ) : channelType === AccountChannelTypeEnum.Sms ? (
        <MuiTelInput
          required
          label="Phone Number"
          value={channelToken}
          onChange={(v) => handleChannelTokenChange(v)}
          defaultCountry="TH"
          error={!!channelTokenError}
          helperText={channelTokenError}
        />
      ) : channelType === AccountChannelTypeEnum.Slack ? (
        <TextField
          required
          label="Slack ID"
          value={channelToken}
          onChange={(e) => handleChannelTokenChange(e.target.value)}
          error={!!channelTokenError}
          helperText={channelTokenError}
        />
      ) : null}

      <Button
        variant="contained"
        color="primary"
        onClick={() => upsertAccount()}
        disabled={
          !!channelTokenError || !channelToken || isUpsertAccountPending
        }
      >
        Next
      </Button>
    </Stack>
  );
};

export default ConnectAccount;
