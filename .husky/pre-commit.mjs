import { exec } from 'node:child_process';

const run = (cmd) => new Promise((resolve, reject) => exec(
  cmd,
  (error, stdout) => {
    if (error) reject(error);
    else resolve(stdout);
  },
));

const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
const modifiedFiles = changeset.split('\n').filter(Boolean);

// Auto-fix and lint staged JS files
const jsFiles = modifiedFiles.filter((f) => f.endsWith('.js'));
if (jsFiles.length > 0) {
  const fileList = jsFiles.join(' ');
  try {
    await run(`npx eslint --fix ${fileList}`);
  } catch {
    // fix ran; lint check below will surface unfixable errors
  }
  await run(`git add ${fileList}`);
  // Fail the commit if unfixable lint errors remain
  const output = await run(`npx eslint ${fileList}`);
  if (output) console.log(output);
}

// Auto-fix and lint staged CSS files
const cssFiles = modifiedFiles.filter((f) => f.endsWith('.css'));
if (cssFiles.length > 0) {
  const fileList = cssFiles.join(' ');
  try {
    await run(`npx stylelint --fix ${fileList}`);
  } catch {
    // fix ran; lint check below will surface unfixable errors
  }
  await run(`git add ${fileList}`);
  // Fail the commit if unfixable lint errors remain
  const output = await run(`npx stylelint ${fileList}`);
  if (output) console.log(output);
}
