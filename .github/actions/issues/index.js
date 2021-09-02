const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('repo-token', { required: true });
const octokit = github.getOctokit(token);
const { repository, issue } = github.context.payload;
const [owner, repo] = repository.full_name.split('/');

// Get repo and issue info
if (!issue) {
  throw new Error(`Couldn't find issue info in current context`);
}

async function getMilestoneNum() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const title = `${year}-${month}`;

  const milestones = await octokit.rest.issues
    .listMilestones({
      owner,
      repo,
    })
    .then((rsp) => rsp.data);

  let milestone = milestones.find((m) => m.title === title);

  if (!milestone) {
    milestone = await octokit.rest.issues
      .createMilestone({
        owner,
        repo,
        title,
      })
      .then((rsp) => rsp.data);
  }

  return milestone.number;
}

function getAssignees() {
  return core
    .getInput('assignees', { default: owner })
    .split(',')
    .map((name) => name.trim());
}

function getLables() {
  return core
    .getInput('labels', { default: 'bug' })
    .split(',')
    .map((label) => label.trim());
}

const run = async () => {
  const [milestone, assignees, labels] = await Promise.all([
    getMilestoneNum(),
    getAssignees(),
    getLables(),
  ]);

  console.log(milestone, assignees, labels);

  const data = await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issue.number,
    milestone,
    assignees,
    labels,
  });

  console.log(data);
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
