import type { DocumentHeadTagsProps } from "@mui/material-nextjs/v15-pagesRouter";
import {
  DocumentHeadTags,
  documentGetInitialProps,
} from "@mui/material-nextjs/v15-pagesRouter";
import {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentProps,
} from "next/document";

export default function MyDocument(
  props: DocumentProps & DocumentHeadTagsProps
) {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
