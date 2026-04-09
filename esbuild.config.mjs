import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

// Build plugin backend: src/plugin.ts → code.js
const pluginBuildOptions = {
  entryPoints: ['src/plugin.ts'],
  bundle: true,
  outfile: 'code.js',
  format: 'iife',
  target: 'es2017',
  sourcemap: true,
};

// Build UI: src/ui/ui.ts → bundled into ui.html
async function buildUI() {
  // Bundle the UI TypeScript
  const result = await esbuild.build({
    entryPoints: ['src/ui/ui.ts'],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2017',
    minify: false,
  });

  const jsCode = result.outputFiles[0].text;

  // Read the CSS
  const css = fs.readFileSync('src/ui/ui.css', 'utf-8');

  // Read the HTML template
  const htmlTemplate = fs.readFileSync('src/ui/ui.html', 'utf-8');

  // Replace the CSS link and script tag with inline versions
  let html = htmlTemplate
    .replace(
      '<link rel="stylesheet" href="./ui.css">',
      `<style>\n${css}\n  </style>`
    )
    .replace(
      '<script src="./ui.ts"></script>',
      `<script>\n${jsCode}\n  </script>`
    );

  fs.writeFileSync('ui.html', html);
}

async function build() {
  await esbuild.build(pluginBuildOptions);
  await buildUI();
  console.log('Build complete');
}

if (isWatch) {
  // Watch mode: rebuild on changes
  const ctx = await esbuild.context(pluginBuildOptions);
  await ctx.watch();

  // Simple polling watcher for UI since it needs the custom HTML assembly
  console.log('Watching for changes...');

  const uiFiles = ['src/ui/ui.ts', 'src/ui/ui.css', 'src/ui/ui.html'];
  let lastMtimes = {};

  async function checkUIChanges() {
    let changed = false;
    for (const file of uiFiles) {
      try {
        const stat = fs.statSync(file);
        if (lastMtimes[file] !== stat.mtimeMs) {
          lastMtimes[file] = stat.mtimeMs;
          changed = true;
        }
      } catch (e) { }
    }
    if (changed) {
      try {
        await buildUI();
        console.log('UI rebuilt');
      } catch (e) {
        console.error('UI build error:', e.message);
      }
    }
  }

  // Initial UI build
  await buildUI();
  console.log('Initial build complete');

  setInterval(checkUIChanges, 500);
} else {
  await build();
}
