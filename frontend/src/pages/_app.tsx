import "@/styles/globals.css";
import { CssBaseline } from "@mui/material";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

const MyApp: AppType<{ session: Session | null }> = (props) => {
  const { Component, pageProps: tmpPageProps } = props;
  const { session, ...pageProps } = tmpPageProps;
  return (
    <SessionProvider session={session}>
      <AppCacheProvider {...props}>
        <CssBaseline />
        <div className={GeistSans.className}>
          <Component {...pageProps} />
        </div>
      </AppCacheProvider>
    </SessionProvider>
  );
};

export default MyApp;
