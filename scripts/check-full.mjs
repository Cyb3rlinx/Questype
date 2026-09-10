import { spawn } from 'node:child_process';

const npmCli = process.env.npm_execpath;
const appUrl = process.env.TEST_APP_URL ?? 'http://localhost:3000';

if (!npmCli) throw new Error('check:full must be started through npm');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed (${code ?? signal})`));
    });
  });
}

async function waitForApp(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`App did not become ready at ${url}: ${String(lastError)}`);
}

async function isAppReady(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function stop(child) {
  if (child.exitCode !== null || child.killed) return;
  child.kill('SIGINT');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

await run(process.execPath, [npmCli, 'run', 'check']);
await run(process.execPath, [npmCli, 'run', 'db:local']);

const server = (await isAppReady(appUrl))
  ? null
  : spawn(process.execPath, ['node_modules/vinext/dist/cli.js', 'dev'], {
      stdio: 'inherit',
    });

try {
  if (server) await waitForApp(appUrl);
  else console.log(`Using the existing local app at ${appUrl}`);
  await run(process.execPath, [npmCli, 'run', 'test:web'], {
    env: { ...process.env, TEST_APP_URL: appUrl },
  });
} finally {
  if (server) await stop(server);
}
