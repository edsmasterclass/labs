/* eslint-env node */

const fs = require('node:fs');
const path = require('node:path');

async function createMissingFiles(blockDirectory, blockName) {
  const files = [`${blockName}.js`, `${blockName}.css`];

  await Promise.all(files.map(async (fileName) => {
    const filePath = path.join(blockDirectory, fileName);

    try {
      await fs.promises.writeFile(filePath, '', { flag: 'wx' });
      // eslint-disable-next-line no-console
      console.log(`Created ${filePath}`);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }));
}

async function scaffoldExistingFolders(blocksDirectory) {
  const entries = await fs.promises.readdir(blocksDirectory, { withFileTypes: true });

  await Promise.all(entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => createMissingFiles(
      path.join(blocksDirectory, entry.name),
      entry.name,
    )));
}

async function scaffoldNamedFolder(blocksDirectory, folderName) {
  if (!folderName || path.basename(folderName) !== folderName) return;

  const blockDirectory = path.join(blocksDirectory, folderName);
  let entry;

  try {
    entry = await fs.promises.lstat(blockDirectory);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  if (entry.isDirectory()) await createMissingFiles(blockDirectory, folderName);
}

function startBlockFolderWatcher(
  blocksDirectory = path.resolve(__dirname, '..', 'blocks'),
) {
  const directory = path.resolve(blocksDirectory);
  const watcher = fs.watch(directory, (eventType, filename) => {
    const task = filename === null
      ? scaffoldExistingFolders(directory)
      : scaffoldNamedFolder(directory, filename.toString());

    task.catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`Failed to scaffold a block folder after ${eventType}:`, error);
    });
  });

  watcher.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Block folder watcher failed:', error);
  });

  return scaffoldExistingFolders(directory)
    .then(() => {
      // eslint-disable-next-line no-console
      console.log(`Block scaffold watcher ready: ${directory}`);
      return watcher;
    })
    .catch((error) => {
      watcher.close();
      throw error;
    });
}

if (require.main === module) {
  const blocksDirectory = path.resolve(__dirname, '..', 'blocks');
  // eslint-disable-next-line no-console
  console.log(`Block scaffold watcher starting: ${blocksDirectory}`);
  startBlockFolderWatcher(blocksDirectory).catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Unable to start the block folder watcher:', error);
    process.exitCode = 1;
  });
}

module.exports = { scaffoldExistingFolders, startBlockFolderWatcher };
