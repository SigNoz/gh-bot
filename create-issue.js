const { REPO_OWNER, REPO_SIGNOZ_CODE, REPO_SIGNOZ_DOCS, pr_number, PR_DOCS_UPDATE_LABEL } = require('./constants')
const ghapi = require('./githubapi').default

/**
 * Generates glorious body of the automated issue
 */
const createIssueBodyContent = (pr_body, pr_url) => `
Please document the changes made by this pr 👉 ${pr_url}

---
${pr_body}
---

Good Day 🤖
`

/**
 * Fetches metadata for the respective PR
 */
const getPRMetadata = async (pr_number) => {
    const response = await ghapi.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
        owner: REPO_OWNER,
        repo: REPO_SIGNOZ_CODE,
        issue_number: pr_number
    })

    const docUpdateLabelExist = response.data.labels.find(labelData => labelData.name === PR_DOCS_UPDATE_LABEL)


    return { pr_url: response.data.pull_request.html_url, pr_body: response.data.body, pr_title: response.data.title, docUpdateLabelExist }


}

/**
 * Creates an issue on the SigNoz Docs repo
 */
const createIssueOnSigNozDocs = async () => {
    const { pr_body, pr_url, pr_title, docUpdateLabelExist } = await getPRMetadata(pr_number)
    if (docUpdateLabelExist) {
        await ghapi.request('POST /repos/{owner}/{repo}/issues', {
            owner: REPO_OWNER,
            repo: REPO_SIGNOZ_DOCS,
            title: `Docs Update: ${pr_title}`,
            body: createIssueBodyContent(pr_body, pr_url),
            labels: [
                'docs'
            ]
        })
    }

}


try {
    createIssueOnSigNozDocs().then(() => {
        console.log("Executed Successfully.")
    })
}
catch (error) {
    console.error(error)
}