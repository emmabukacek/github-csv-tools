function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const createIssue = async (octokit, issueInfo, state = false) => {
  const comments = issueInfo.comments;
  delete issueInfo.comments;

  const res = await octokit.issues.create(issueInfo)

  console.log("Created issue #", res.data.number);

  if (res.status !== 201) throw new Error(res);
  if (!comments) return res;

  console.log("Comments to create:", comments);

  // console.log("Creating comment", {
  //   owner: issueInfo.owner,
  //   repo: issueInfo.repo,
  //   issue_number: 142,
  //   body: comments[0]
  // });
  //
  // const testResponse = await octokit.issues.createComment({
  //   owner: issueInfo.owner,
  //   repo: issueInfo.repo,
  //   issue_number: 142,
  //   body: comments[0]
  //   });
  //
  // console.log("Created single comment", testResponse);

  for (const comment of comments) {
    console.log("WE IN THE FOR LOOP FRIENDS");

    const commentResponse = await octokit.issues.createComment({
      owner: issueInfo.owner,
      repo: issueInfo.repo,
      issue_number: res.data.number,
      body: comment
      });

    console.log("Created comment:", commentResponse);
  }
  return res;
}

module.exports = { createIssue };
