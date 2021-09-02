const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('repo-token', { required: true });
const sha = core.getInput('repo-sha', { required: true });
const octokit = github.getOctokit(token);
const { repository } = github.context.payload;
const [owner, repo] = repository.full_name.split('/');

const run = async () => {
  const issues = await octokit.rest.issues
    .listForRepo({ owner, repo, state: 'closed' })
    .then(({ data }) => data);

  console.log(issues);

  await octokit.rest.repos.createOrUpdateFileContents({
    sha,
    owner,
    repo,
    path: 'README.md',
    message: 'update README.md',
    content: issues && issues.length && issues.map((v) => v.title).join('\n'),
  });
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
