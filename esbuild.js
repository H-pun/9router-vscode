const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  // 1. Build Extension Backend (Node.js)
  const extCtx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'info',
  });

  // 2. Build React + @xyflow/react Browser Bundle for Webview
  const graphCtx = await esbuild.context({
    entryPoints: ['src/graph-app/index.tsx'],
    bundle: true,
    format: 'iife',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'media/topologyFlow.js',
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
    },
    logLevel: 'info',
  });

  if (watch) {
    await extCtx.watch();
    await graphCtx.watch();
  } else {
    await extCtx.rebuild();
    await graphCtx.rebuild();
    await extCtx.dispose();
    await graphCtx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
