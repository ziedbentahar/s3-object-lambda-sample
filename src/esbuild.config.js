require('esbuild').build({
    entryPoints: ['./lambdas/remove-sensitive-fields.ts'],
    entryNames: '[dir]/[name]',
    outbase:'.',
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: '../build',
    platform: 'node',
    write: true    
}).catch(() => process.exit());