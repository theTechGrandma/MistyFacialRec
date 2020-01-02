misty.Debug("Announce Know Person Skill");
misty.Set("azureURL","https://mistyspeech-tam.azurewebsites.net/api/AzureMistyFacialRec");
misty.Set("azureURL1","https://storageaccountmistyadc2.blob.core.windows.net/outcontainer/TTSOutput.wav");


misty.RegisterEvent("FaceRecognition", "FaceRecognition", 250);
misty.StartFaceRecognition();

function _FaceRecognition(data) {
    misty.Debug("Face Recognition Event Triggered");
	
    // Stop face detection
	misty.StopFaceRecognition();
	
	let azureURL = misty.Get("azureURL");
    // Use this to help debug issues!
    misty.Debug(JSON.stringify(data));
	var name = data.PropertyTestResults[0].PropertyParent.PersonName;

	try {
	if (name === undefined && name === null) {
		//Not Recognized
		//create the text to speech request
		// Play an audio clip
		misty.PlayAudio("s_Anger3.wav");
		// Change LED to white
		misty.ChangeLED(255, 0, 0);
		misty.SendExternalRequest("GET", azureURL + "?message=Stranger Danger");
		misty.Debug("Person not recognized.");
		misty.DisplayImage("e_Anger.jpg");
	}
	else {
		//Recognized
		//create the text to speech request
		// Play an audio clip
		misty.PlayAudio("s_Love.wav");
		// Change LED to white
		misty.ChangeLED(255, 255, 255);
		misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name);
		misty.Debug("I recognize: " + name);
		misty.DisplayImage("e_Love.jpg");
		}
	}
	catch (err) {
		misty.Debug(`Send External failed: ${err}`);
	}
    
};

function _SendExternalRequest(data) {
	
	misty.Debug("Response Received");
	misty.Debug(JSON.stringify(data));

	if (data.Result.ResponseObject.Data === "") {
		misty.Debug(JSON.stringify(data.Result.ResponseObject.Data));
		let azureURL1 = misty.Get("azureURL1");
		misty.Pause(2000)
		misty.SendExternalRequest("GET", azureURL1, null, null, "{}", true, true, "TTSOutput.wav", "audio/x-wav");
	}
	else {
		misty.Debug("ERROR: Empty user callback data");
	}
}