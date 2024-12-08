import Head from "next/head";

import RichTextEditor from "@/modules/template-engine/rich-text-editor/RichTextEditor";
import useEditor from "@/modules/template-engine/rich-text-editor/useEditor";
import { Button } from "@mui/material";
import styles from "./index.module.css";

export default function Home() {
  const editor = useEditor();
  if (!editor) return null;
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <RichTextEditor editor={editor} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log(editor.getJSON());
          }}
        >
          getJson
        </Button>
      </main>
    </>
  );
}
