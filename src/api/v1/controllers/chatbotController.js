const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');


async function getResponseFromDialogflow(data, projectId = 'newagent-fbpr') {
    // A unique identifier for the given session
    const sessionId = uuid.v4();
    const pth = __dirname + "/newagent-fbpr-00b4b2bbd863.json";
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient(
        {
            keyFilename: pth
        }
    );
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
    return obj;
}

module.exports.getResult = async (req, res) => {
    try {
        const data = req.body.data;
        const result = await getResponseFromDialogflow(data);
        res.status(200).json({
            data: { ...result },
            success: true
        });
        // res.send("hello world")
    }
    catch (err) {
        res.status(500).json({
            data: err,
            success: false
        })
    }
}

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */

