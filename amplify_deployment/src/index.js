const core = require('@actions/core');
// const github = require('@actions/github');
const AWS = require('aws-sdk');
const axios = require('axios');
const { readFileSync } = require('fs');

const appId = core.getInput('appId');
const branchName = core.getInput('appId');
const artifactPath = core.getInput('artifactPath');
const region = core.getInput('region');

var amplify = new AWS.Amplify({ region });

const createDeployment = (params) => {
  return amplify
    .createDeployment(deployParams)
    .promise()
    .catch((e) => {
      core.setFailed(e.stack);
      throw Error(e);
    });
};

const startDeployment = (params) => {
  return amplify
    .startDeployment(params)
    .promise()
    .catch((e) => {
      core.setFailed(e.stack);
      throw Error(e);
    });
};

const uploadArtifact = (deploymentResult, artifactPath) => {
  const { zipUploadUrl } = deploymentResult;
  console.log(deploymentResult);

  const data = readFileSync(artifactPath);

  return axios.put(
    zipUploadUrl,
    { data },
    {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'Content-Type': 'application/zip' },
    },
  );
};

let createdDeployment;

createDeployment({ appId, branchName })
  .then((result) => {
    createdDeployment = result;
    return result;
  })
  .then((createdDeployment) => uploadArtifact(createdDeployment, artifactPath))
  .then(() => {
    const { jobId } = createdDeployment;
    return startDeployment({ appId, branchName, jobId });
  })
  .then((createdDeployment) => {
    core.setOutput('jobId', createrDeployment.jobId);
    console.log(createdDeployment);
  })
  .catch((e) => {
    const { jobId } = createdDeployment;
    if (jobId) {
      console.log(`Error detected, stopping anmplify job ${jobId}`);
      var params = { appId, branchName, jobId };
      amplify.stopJob(params, (err, data) => {
        console.log(data);
      });
    }
    core.setFailed(e.stack);
    throw Error(e);
  });
