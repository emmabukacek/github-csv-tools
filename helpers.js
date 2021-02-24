const createIssue = async (octokit, issueInfo, state = false) => {
  const comments = issueInfo.comments;
  delete issueInfo.comments;

  const res = await octokit.issues.create(issueInfo)

  console.log("Created issue #", res.data.number, "successfully.");

  if (res.status !== 201) throw new Error(res);
  if (!comments) return res;

  console.log("Issue #", res.data.number, " has ", comments.length, "comments to create. These will be created soon.");

  for (let i = 0; i < comments.length; i++) {
    console.log("Beginning work to create comment", i, " for issue #", res.data.number);

    await octokit.issues.createComment({
      owner: issueInfo.owner,
      repo: issueInfo.repo,
      issue_number: res.data.number,
      body: comments[i]
      });

    console.log("Created comment", i, " for issue #", res.data.number, "successfully.");
  }
  return res;
}

module.exports = { createIssue };
