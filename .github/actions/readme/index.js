const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('repo-token', { required: true });
const octokit = github.getOctokit(token);
const { repository } = github.context.payload;
const [owner, repo] = repository.full_name.split('/');

const run = async () => {
  const issues = await octokit.rest.issues
    .listForRepo({ owner, repo })
    .then(({ data }) => data);

  console.log(issues);

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: 'README.md',
    message: `post '${issues && issues.length && issues.map((v) => v.title)}'`,
    content: 'ok',
  });
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
