import { Button, List, ListItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api";
import reactLogo from "/react.svg";
import viteLogo from "/vite.svg";

function Home() {
  const [count, setCount] = useState(0);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.AuthApi.authControllerMe().then((res) => {
      console.log(res);
    });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button
          variant="contained"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {auth.isAuthenticated ? (
        <div>
          Hello {JSON.stringify(auth.user?.profile)}{" "}
          <div>
            access token: {auth.user?.access_token} <br />
          </div>
          <Button variant="contained" onClick={() => void auth.removeUser()}>
            Log out
          </Button>
        </div>
      ) : (
        <Button
          variant="contained"
          onClick={() =>
            void auth.signinRedirect({
              state: {
                returnTo: window.location,
              },
            })
          }
        >
          Log in
        </Button>
      )}
      <List>
        <ListItem>
          <Button variant="contained" onClick={() => void navigate("/about")}>
            About
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            onClick={() => void navigate("/concerts")}
          >
            Concerts
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            onClick={() => void navigate("/concerts/New York")}
          >
            Concerts in New York
          </Button>
        </ListItem>
        <ListItem>
          <Button
            variant="contained"
            onClick={() => void navigate("/concerts/trending")}
          >
            Trending Concerts
          </Button>
        </ListItem>
      </List>
    </>
  );
}

export default Home;
