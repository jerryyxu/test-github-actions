const fs = require('fs');
const github = require('@actions/github');

const { token, repo: repository } = require('args-parser')(process.argv);

const groupBy = (arr, keyFn) =>
  [...arr].reduce((rv, x) => (rv[keyFn(x)] = rv[keyFn(x)] || []).push(x), {});

const label2Emoji = {
  文章: '📝',
  小记: '✍',
};

async function run() {
  try {
    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.split('/');

    let issues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'closed',
    });

    issues = groupBy(issues, (x) => x.milestone.title);

    let content = '';

    Object.keys(issues)
      .sort((x, y) => (x > y ? -1 : 1))
      .forEach((m) => {
        content += `## ${m}\n`;

        issues.forEach(({ title, labels }) => {
          const l = labels.find(({ title }) =>
            label2Emoji.keys().includes(title)
          );

          content += `- ${l ? label2Emoji[l] + ' ' : ''}${title}`;
        });
      });

    fs.writeFile('README.md', content);
  } catch (err) {
    console.error(err.message);
  }
}

run();
