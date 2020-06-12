const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function getDataFromPullRequestEvent(client, payload) {
    const number = payload.pull_request.number
    const title = payload.pull_request.title
    const body = payload.pull_request.body
    const url = payload.pull_request.html_url
    const branch_name = payload.pull_request.head.ref

    return {
        number: number || '',
        title: title || '',
        body: body || '',
        url: url || '',
        branch_name: branch_name || ''
    }
}

async function getDataFromIssueCommentEvent(client, payload, repo) {
    const number = payload.issue.number
    const title = payload.issue.title
    const body = payload.issue.body
    const url = payload.issue.html_url

    const pr = await client.pulls.get({
        owner: repo.owner,
        repo: repo.repo,
        pull_number: number,
    });

    const branch_name = pr.data.head.ref

    return {
        number: number || '',
        title: title || '',
        body: body || '',
        url: url || '',
        branch_name: branch_name || ''
    }
}

async function getData() {
    const token = core.getInput('github-token', { required: true });
    const client = new GitHub(token, {});
    
    switch (context.eventName) {
        case 'pull_request':
            return await getDataFromPullRequestEvent(
                client,
                context.payload
            )
        case 'issue_comment':
            return await getDataFromIssueCommentEvent(
                client,
                context.payload,
                context.repo
            )
        case 'repository_dispatch':
            return await getDataFromIssueCommentEvent(
                client,
                context.payload.client_payload.github.payload,
                context.repo
            )
        default:
            throw new Error(`Event "${context.eventName}" not handled`)
    }
}

async function main() {    
    const data = await getData()

    console.log(JSON.stringify(data))

    core.setOutput('pr', data.number || '');
    core.setOutput('number', data.number || '');
    core.setOutput('title', data.title || '');
    core.setOutput('body', data.body || '');
    core.setOutput('url', data.url || '');
    core.setOutput('branch_name', data.branch_name || '');
}

main().catch(err => core.setFailed(err.message));
