import { CloudDone, HelpOutline } from "@mui/icons-material";
import {
  CircularProgress,
  FormHelperText,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { type Editor } from "@tiptap/react";
import {
  LinkBubbleMenu,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHighlightColor,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonTextColor,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  MenuSelectTextAlign,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";

type RichTextEditorProps = {
  editor: Editor;
  isSaved: boolean;
};

export default function RichTextEditor({
  editor,
  isSaved,
}: RichTextEditorProps) {
  return (
    <RichTextEditorProvider editor={editor}>
      <RichTextField
        controls={
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonStrikethrough />
            <MenuDivider />
            <MenuButtonTextColor
              // defaultTextColor={theme.palette.text.primary}
              swatchColors={[
                { value: "#000000", label: "Black" },
                { value: "#ffffff", label: "White" },
                { value: "#888888", label: "Grey" },
                { value: "#ff0000", label: "Red" },
                { value: "#ff9900", label: "Orange" },
                { value: "#ffff00", label: "Yellow" },
                { value: "#00d000", label: "Green" },
                { value: "#0000ff", label: "Blue" },
              ]}
            />
            <MenuButtonHighlightColor
              swatchColors={[
                { value: "#595959", label: "Dark grey" },
                { value: "#dddddd", label: "Light grey" },
                { value: "#ffa6a6", label: "Light red" },
                { value: "#ffd699", label: "Light orange" },
                { value: "#ffff00", label: "Yellow" },
                { value: "#99cc99", label: "Light green" },
                { value: "#90c6ff", label: "Light blue" },
                { value: "#8085e9", label: "Light purple" },
              ]}
            />
            <MenuDivider />
            <MenuButtonEditLink />
            <MenuDivider />
            <MenuSelectTextAlign />
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuDivider />
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            <MenuDivider />
            <MenuButtonHorizontalRule />
            <MenuDivider />
            <MenuButtonRemoveFormatting />
            <MenuDivider />
            <MenuButtonUndo />
            <MenuButtonRedo />
            <LinkBubbleMenu />
            <Stack
              direction="row"
              flex={1}
              justifyContent="flex-end"
              spacing={1}
              alignItems="center"
            >
              {isSaved ? (
                <>
                  <CloudDone />
                  <Typography width={60}>Saved</Typography>
                </>
              ) : (
                <>
                  <CircularProgress size={20} />
                  <Typography width={60}>Saving...</Typography>
                </>
              )}
            </Stack>
          </MenuControlsContainer>
        }
      />
      <FormHelperText>
        <Link
          href="https://liquidjs.com/tutorials/intro-to-liquid.html"
          target="_blank"
          rel="noreferrer"
        >
          <Stack
            direction="row"
            width="100%"
            alignContent="end"
            justifyContent="flex-end"
            spacing={1}
            alignItems="center"
          >
            <HelpOutline fontSize="small" />
            <Typography variant="caption">
              Learn more about Liquid syntax
            </Typography>
          </Stack>
        </Link>
      </FormHelperText>
    </RichTextEditorProvider>
  );
}
