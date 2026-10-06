/* eslint-env node */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, test } = require('node:test');
const { scaffoldExistingFolders, startBlockFolderWatcher } = require('../scripts/watch-blocks.js');

let temporaryDirectory;

afterEach(async () => {
  if (temporaryDirectory) {
    await fs.promises.rm(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

async function createTemporaryBlocksDirectory() {
  temporaryDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'block-watcher-'));
  return temporaryDirectory;
}

async function waitForScaffold(blocksDirectory, blockName) {
  const javascriptFile = path.join(blocksDirectory, blockName, `${blockName}.js`);
  const cssFile = path.join(blocksDirectory, blockName, `${blockName}.css`);

  await new Promise((resolve, reject) => {
    let interval;
    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Timed out waiting for files in ${blockName}`));
    }, 5000);
    interval = setInterval(() => {
      if (fs.existsSync(javascriptFile) && fs.existsSync(cssFile)) {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, 25);
  });
}

test('creates missing files in existing block folders without overwriting files', async () => {
  const blocksDirectory = await createTemporaryBlocksDirectory();
  const existingFolder = path.join(blocksDirectory, 'existing-block');
  await fs.promises.mkdir(existingFolder);
  await fs.promises.writeFile(path.join(existingFolder, 'existing-block.js'), 'keep this');

  await scaffoldExistingFolders(blocksDirectory);

  assert.equal(
    await fs.promises.readFile(path.join(existingFolder, 'existing-block.js'), 'utf8'),
    'keep this',
  );
  assert.equal(
    await fs.promises.readFile(path.join(existingFolder, 'existing-block.css'), 'utf8'),
    '',
  );
});

test('creates matching files when a new block folder is added', async () => {
  const blocksDirectory = await createTemporaryBlocksDirectory();
  const watcher = await startBlockFolderWatcher(blocksDirectory);

  try {
    const blockName = 'new-block';
    await fs.promises.mkdir(path.join(blocksDirectory, blockName));
    await waitForScaffold(blocksDirectory, blockName);
  } finally {
    watcher.close();
  }
});
