import { Button, Stack, Typography } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <Stack spacing={2}>
      <img
        loading="lazy"
        src="small-poster.jpg"
        alt="small poster"
        style={{
          objectFit: "contain",
          height: "60dvh",
        }}
      />
      <Typography variant="h5" textAlign="center">
        Welcome {auth.user?.profile?.email}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <Button
          variant="contained"
          onClick={() => void navigate("/notifications")}
        >
          notifications center
        </Button>
      </Stack>
    </Stack>
  );
}

export default Home;
