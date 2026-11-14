/**
 * Local production preview: serves dist/ with PHP's built-in server so the
 * inquiry endpoint works exactly as on Hostinger. Falls back to `astro preview`.
 */
import { spawn, spawnSync } from 'node:child_process';
const port = process.env.PORT || '4322';
const hasPhp = spawnSync('php', ['-v']).status === 0;
if (hasPhp) {
  console.log(`Preview (static + PHP) → http://localhost:${port}`);
  spawn('php', ['-S', `0.0.0.0:${port}`, '-t', 'dist', 'scripts/router.php'], { stdio: 'inherit' });
} else {
  console.log('PHP not found — starting static preview (contact form endpoint disabled).');
  spawn('npx', ['astro', 'preview', '--port', port], { stdio: 'inherit', shell: true });
}
