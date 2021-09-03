const fs = require('fs/promises');
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

    let { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'closed',
    });

    console.log(issues);

    // 如果没有设置里程碑 按更新时间分组
    // updated_at: 2021-09-02T14:06:12Z
    issues = groupBy(issues, (x) =>
      x.milestone ? x.milestone.title : x.updated_at.slice(0, 10)
    );

    console.log(issues);

    let content = '';

    Object.keys(issues)
      .sort((x, y) => (x > y ? -1 : 1))
      .forEach((m) => {
        content += `## ${m}\n`;

        issues[m].forEach(({ title, html_url, labels }) => {
          const l = labels.find(({ title }) =>
            label2Emoji.keys().includes(title)
          );

          content += `- [${
            l ? label2Emoji[l] + ' ' : ''
          }${title}](${html_url})`;
        });
      });

    console.log(content);

    fs.writeFile('README.md', content, { encoding: 'utf8' });
  } catch (err) {
    console.error(err.message);
  }
}

run();
