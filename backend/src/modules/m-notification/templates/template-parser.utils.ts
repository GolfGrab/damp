import { MarkdownSerializerState } from 'prosemirror-markdown';
import { Node as ProseMirrorNode } from 'prosemirror-model';

export function renderHardBreak(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
  parent: ProseMirrorNode,
  index: number,
) {
  const br = '\n';
  for (let i = index + 1; i < parent.childCount; i += 1) {
    if (parent.child(i).type !== node.type) {
      state.write(br);
      return;
    }
  }
}

export function renderCode(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  state.write('`');
  state.text(node.textContent, false);
  state.write('`');
}

export function renderCodeBlock(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  state.write('```');
  state.ensureNewLine();
  state.text(node.textContent, false);
  state.ensureNewLine();
  state.write('```');
  state.closeBlock(node);
}

export function renderListItem(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
  parent: ProseMirrorNode,
  index: number,
) {
  if (parent.type.name === 'bullet_list') {
    state.write('- '); // Bullet list marker
  } else if (parent.type.name === 'ordered_list') {
    const start = (parent.attrs.order as number) || 1;
    const nStr = String(start + index);
    state.write(`${nStr}. `); // Ordered list marker like "1. "
  }
  state.renderInline(node);
  state.ensureNewLine();
}

export function renderOrderedList(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  console.log(JSON.stringify(node));
  const start = (node.attrs.order as number) ?? 1;
  state.renderList(node, '', (i) => {
    const nStr = String(start + i);
    return nStr + '. ';
  });
}

export function renderBulletList(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  state.renderList(node, '', () => {
    return '- ';
  });
}

export function renderDefaultInline(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  state.renderContent(node);
}

export function renderDefaultBlock(
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) {
  state.renderContent(node);
  state.closeBlock(node);
}
