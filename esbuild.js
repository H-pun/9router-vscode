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

  // 2. Build Topology Flow Bundle (Browser IIFE - React Flow)
  const topologyCtx = await esbuild.context({
    entryPoints: ['src/graph-app/topologyEntry.tsx'],
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

  // 3. Build Analytics Bundle (Browser IIFE - Recharts)
  const analyticsCtx = await esbuild.context({
    entryPoints: ['src/graph-app/analyticsEntry.tsx'],
    bundle: true,
    format: 'iife',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'media/analyticsFlow.js',
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
    },
    logLevel: 'info',
  });

  if (watch) {
    await extCtx.watch();
    await topologyCtx.watch();
    await analyticsCtx.watch();
  } else {
    await extCtx.rebuild();
    await topologyCtx.rebuild();
    await analyticsCtx.rebuild();
    await extCtx.dispose();
    await topologyCtx.dispose();
    await analyticsCtx.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
