const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function getDataFromPullRequestEvent(client) {
    // const sha = context.payload.pull_request.head.sha
    // const result = await client.repos.listPullRequestsAssociatedWithCommit({
    //     owner: context.repo.owner,
    //     repo: context.repo.repo,
    //     commit_sha: sha ,
    // });
    // const pr = result.data.length > 0 && result.data[0];
    console.log(JSON.stringify(context))

    const number = context.payload.pull_request.number
    const title = context.payload.pull_request.title
    const body = context.payload.pull_request.body
    const url = context.payload.pull_request.html_url
    const branch_name = context.payload.pull_request.head.ref

    return {
        number: number || '',
        title: title || '',
        body: body || '',
        url: url || '',
        branch_name: branch_name || ''
    }
}

async function getDataFromIssueCommentEvent(client) {

    console.log(JSON.stringify(context))

    const number = context.payload.issue.number
    const title = context.payload.issue.title
    const body = context.payload.issue.body
    const url = context.payload.issue.html_url

    const pr = await client.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
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
            return await getDataFromPullRequestEvent(client)
        case 'issue_comment':
            return await getDataFromIssueCommentEvent(client)
        default:
            throw new Error('Event name not handled')
    }
}

async function main() {

    const data = await getData()

    console.log(JSON.stringify(context))
    console.log(JSON.stringify(data))

    core.setOutput('pr', data.number || '');
    core.setOutput('number', data.number || '');
    core.setOutput('title', data.title || '');
    core.setOutput('body', data.body || '');
    core.setOutput('url', data.url || '');
    core.setOutput('branch_name', data.branch_name || '');
}

main().catch(err => core.setFailed(err.message));
