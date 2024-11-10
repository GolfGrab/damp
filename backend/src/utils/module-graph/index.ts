import { INestApplication, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { fromUint8Array } from 'js-base64';
import { SpelunkerModule } from 'nestjs-spelunker';
import { deflate } from 'pako';

export function generateModuleGraph(app: INestApplication<any>) {
  const ignoreModules: string[] = ['PrismaModule', 'TypedConfigModule'];
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const filteredEdges = edges.filter(
    ({ from, to }) =>
      !ignoreModules.includes(from.module.name) &&
      !ignoreModules.includes(to.module.name),
  );
  const mermaidEdges = filteredEdges.map(
    ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  );
  const rawString = 'flowchart TD\n' + mermaidEdges.join('\n');
  writeFileSync('module-graph.mermaid', rawString);

  const websiteState = {
    code: rawString,
    mermaid: '{"theme": "dark"}',
    autoSync: true,
    updateDiagram: true,
  };

  const json = JSON.stringify(websiteState);

  const data = new TextEncoder().encode(json);
  const compressed = deflate(data, { level: 9 });
  const pakoEncoded = fromUint8Array(compressed, true);

  const url = 'https://mermaid.live/edit#pako:' + pakoEncoded;

  Logger.log(`🚀 Module graph is available at: ${url}`);
}
