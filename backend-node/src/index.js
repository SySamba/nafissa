import { buildApp } from './server.js';

const host = process.env.HOST || '0.0.0.0';
const preferredPort = Number(process.env.PORT) || 3001;
/** Si 3001 est pris (ancienne instance Node, autre app), essaye jusqu’à +9. */
const MAX_TRIES = 10;

const app = await buildApp();

let boundPort = null;
let lastErr = null;

for (let offset = 0; offset < MAX_TRIES; offset++) {
  const port = preferredPort + offset;
  try {
    await app.listen({ port, host });
    boundPort = port;
    break;
  } catch (err) {
    lastErr = err;
    if (err?.code !== 'EADDRINUSE') throw err;
  }
}

if (boundPort == null) {
  console.error(
    `\n⚠ Ports ${preferredPort}–${preferredPort + MAX_TRIES - 1} déjà utilisés.\n`,
    lastErr?.message || lastErr,
    '\n\nPowerShell pour libérer le port:',
    `\n  Get-NetTCPConnection -LocalPort ${preferredPort} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
    '\n',
  );
  process.exit(1);
}

if (boundPort !== preferredPort) {
  console.warn(`\n⚠ Port ${preferredPort} occupé — API démarrée sur le port ${boundPort}. Mettez PORT=${boundPort} dans .env ou le proxy Vite.\n`);
}

app.log.info(`API Node NAFISSA sur ${host}:${boundPort}`);
