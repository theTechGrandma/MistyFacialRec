const rp = require('request-promise');
const xmlbuilder = require('xmlbuilder');
const storage = require('azure-storage');

const azureStorage = process.env["AccountName"];
const storageKey = process.env["storageKey"];
const subscriptionKey = process.env["SubscriptionKey"];

module.exports = async function (context, req) {
    context.log('Misty Demo Function Call Initialized.');
    
    if (!subscriptionKey) {
        context.res = {
            status: 400,
            body: "Error With Service Token"
        };
        //context.bindings.outputBlob = "The message is: " + text;
        context.done();
        return;
    };

    textToGenerate = "";
    if (req.query.message || (req.body && req.body.message)) {
        textToGenerate = (req.query.message || req.body.message)
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a message in the request string or in the request body"
        };
        context.done();
        return;
    }

    try {
        const accessToken = await getAccessToken();
        console.log("Got AccessToken");
        await textToSpeech(accessToken, textToGenerate, context);
        console.log("Text: " + textToGenerate);
    } catch (err) {
        context.log(`Something went wrong: ${err}`);
    }
};

// Gets an access token.
function getAccessToken() {
    let options = {
        method: 'POST',
        uri: 'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken', // Be sure this base URL matches your region
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, text, context) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('name', 'en-US-Guy24kRUS') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://eastus.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'YOUR_RESOURCE_NAME',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                try {
                    var options = {contentSettings:{contentType:'audio/x-wav'}}
                    var blobService = storage.createBlobService(azureStorage, storageKey);
                    //var blobService = context.subscriptionKey
                    var writeStream = blobService.createWriteStreamToBlockBlob(
                        "outcontainer", 
                        "TTSOutput.wav", 
                        options,
                        (err, result, response) => {
                        if (err) {
                            handleError(err);
                            return;
                        }
                    });
                    request.pipe(writeStream);
                }
                catch (err) {
                    context.log(`Context binding failed: ${err}`);
                }

                context.log('\nYour file is ready.\n')
            }
        });
    return request;

};