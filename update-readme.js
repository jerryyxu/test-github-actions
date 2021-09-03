const fs = require('fs');
const github = require('@actions/github');

const { token, repo: repository } = require('args-parser')(process.argv);

async function run() {
  try {
    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.full_name.split('/');

    const issues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'closed',
    });

    fs.writeFile('README.md', issues.map(({ title }) => title).join('\n'));
  } catch (err) {
    console.error(err.message);
  }
}

run();
