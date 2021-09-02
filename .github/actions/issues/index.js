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

// 当前日期所以月份
function getDaysOfMonth(curDate) {
  return new Date(curDate.getFullYear(), curDate.getMonth() + 1, 0).getDate();
}

// 返回里程碑 number
// 如果当前里程碑不存在 根据当前月份创建
async function getOrCreateMilestone() {
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
        due_on: `${year}-${month}-${getDaysOfMonth(now)}`,
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
  const labels = core.getInput('labels');

  return labels ? labels.split(',').map((label) => label.trim()) : [];
}

const run = async () => {
  const data = { owner, repo, issue_number: issue.number };

  // 设置里程碑
  if (issue.milestone === null) {
    data.milestone = await getOrCreateMilestone();
  }

  // 设置 assignees
  if (!issue.assignees?.length) {
    data.assignees = getAssignees();
  }

  // 设置标签
  if (!issues.labels?.length) {
    data.labels = getLables();
  }

  console.log('[update issue]: ', data);

  await octokit.rest.issues.update(data);
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
