import fs from 'fs/promises';
import fetch from 'node-fetch';

async function run() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/jerryyxu/test-github-actions/issues?state=closed'
    );

    const data = await response.json();

    await fs.writeFile('README.md', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}

run();
