const createIssue = (octokit, issueInfo, state = false) => {
  const comments = issueInfo.comments;
  delete issueInfo.comments;

  return new Promise((resolve, reject) => {
    octokit.issues.create(issueInfo).then(
      (res) => {
        if (res.status === 201) {
          if (state === false) {
            // Success creating the issue and we do not have to close the issue, so we're done.
            if (!comments) {
              console.log("No comments, TAKING OFF EARLY FOLKS SEE YAAAAAAAA");
              return resolve(res);
            }

            console.log("Comments to create:", comments);

            // resolve(res);

            const commentPromises = comments.map(comment => {
              console.log("YO I AM CREATING A COMMENT", comment);

              return new Promise((resolve, reject) => {
                octokit.issues.createComment({
                  owner: issueInfo.owner,
                  repo: issueInfo.repo,
                  issue_number: res.data.number,
                  body: comment
                }).then(result => resolve(result), result => reject(result))
              })
              });

              return Promise.all(commentPromises)
                .then(
                  function(result) {
                    console.log("RESOLVE", result);
                    resolve(result);
                  },
                  function(result) {
                    console.log("REJECT", result);
                    reject(result);
                  });
          } else {
            // need to close the issue!
            const issueNumber = res.data.number;
            octokit.issues
              .update({
                owner: issueInfo.owner,
                repo: issueInfo.repo,
                issue_number: issueNumber,
                state,
              })
              .then(
                (editRes) => {
                  resolve(editRes);
                },
                (err) => {
                  reject(err);
                }
              );
          }
        } else {
          // error creating the issue
          reject(res);
        }
      },
      (err) => {
        reject(err);
      }
    );
  });
};

module.exports = { createIssue };
