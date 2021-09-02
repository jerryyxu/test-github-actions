/******/ "use strict";
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const core = require('@actions/core');
const github = require('@actions/github');

const token = core.getInput('repo-token', { required: true });
const octokit = github.getOctokit(token);
const { repository, issue } = github.context.payload;
const [owner, repo] = repository.full_name.split('/');

const run = async () => {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: 'README.md',
    message: `post '${issue.title}'`,
    content: 'ok',
  });
};

try {
  run();
} catch (error) {
  core.setFailed(error.message);
}

