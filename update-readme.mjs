import fs from 'fs/promises';
import fetch from 'node-fetch';
import argsParser from 'args-parser';

async function run() {
  try {
    const args = argsParser.parse(process.argv);

    const response = await fetch(
      `https://api.github.com/repos/${args.repo}/issues?state=closed`
    );

    const issues = await response.json();

    await fs.writeFile(
      'README.md',
      issues.map(({ title }) => title).join('\n')
    );
  } catch (err) {
    console.error(err.message);
  }
}

run();
