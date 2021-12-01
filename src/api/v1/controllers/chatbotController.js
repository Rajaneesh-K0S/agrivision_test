const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function getResponseFromDialogflow(data, projectId = 'newagent-fbpr') {
    try {
        // A unique identifier for the given session
        const sessionId = uuid.v4();

        // Create a new session
        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: "./newagent-fbpr-00b4b2bbd863.json"
        });
        const sessionPath = sessionClient.projectAgentSessionPath(
            projectId,
            sessionId
        );

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: data,
                    // The language used by the client (en-US)
                    languageCode: 'en-US',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        let obj = [];
        obj.push(responses[0].queryResult.fulfillmentText);
        obj.push(responses[0].queryResult.intent.displayName);
        res.status(200).json({
            data: { ...obj },
            success: true
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}

module.exports = { getResponseFromDialogflow, findResponse };
