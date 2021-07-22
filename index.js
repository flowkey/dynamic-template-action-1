const core = require('@actions/core');
const github = require('@actions/github');
const mustache = require('mustache');

async function run(){
    try {

      // requires GitHub Token to allow PR updates
      const ghToken = core.getInput('token', {required: true})

      // Get the JSON webhook payload for the event that triggered the workflow
      const payload = JSON.stringify(github.context.payload, undefined, 2)
      //core.info(`The event payload: ${payload}`);

      // Show PR details
      const pr = github.context.payload.pull_request;
      core.info(`Pull request body: ${pr.body}`);
      core.info(`Pull request title: ${pr.title}`);

      // update PR body
      const octokit = github.getOctokit(ghToken);
      const request = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: github.context.payload.pull_request.number,
        body: mustache.render(pr.body, pr),
        title: mustache.render(pr.title, pr),
      }
      core.info(`update request: ${request}`);
      const response = await octokit.rest.pulls.update(request);

      core.info(`Response: ${response.status}`);
      if (response.status !== 200) {
        core.error(`Updating the pull request has failed: ${response.text}`);
      }

    } catch (error) {
      core.setFailed(error.message);
    }
}

run();
