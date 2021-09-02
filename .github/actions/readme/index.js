const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('repo-token', { required: true });
const sha = core.getInput('repo-sha', { required: true });
const octokit = github.getOctokit(token);
const { repository } = github.context.payload;
const [owner, repo] = repository.full_name.split('/');

const run = async () => {
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'closed',
  });

  const data = {
    sha,
    owner,
    repo,
    path: 'README.md',
    message: 'update README.md',
    content: issues && issues.length && issues.map((v) => v.title).join('\n'),
  };

  console.log(data);

  await octokit.rest.repos.createOrUpdateFileContents(data);
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
