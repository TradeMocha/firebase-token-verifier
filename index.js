'use strict';

// Load the AWS SDK
const AWS = require('aws-sdk');
const fetch = require("node-fetch");

// Will get the secret name from AWS SecretManager with it's custom response 'circular' data structure.
// We need to promisfy the callback internal to the function to be able to wait for the async call to complete.
function _getSecret(secretsManager, secretName) {
    console.log("Beginning secret pull and decrypt");
    return secretsManager.getSecretValue({SecretId: secretName}).promise();
}

module.exports.verifyCaptchaToken = async function verifyToken(awsRegion, secretName, token) {
    // Create a Secrets Manager client
    const secretsManager = new AWS.SecretsManager({
        region: awsRegion
    });

    try {
        const sm_response = await _getSecret(secretsManager, secretName);
        const secretJSON = JSON.parse(sm_response.SecretString);
        const secret = secretJSON['secret'];

        // Initialize our application with Firebase
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;
        const response = await fetch(url, {method: 'post'});
        return response.json();
    } catch (error) {
        return error;
    }
}