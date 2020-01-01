misty.Debug("Announce Know Person Skill");
misty.Set("azureURL","https://mistyspeech-tam.azurewebsites.net/api/HttpTrigger1?code=FaBOOiaNLheDTeSXwrwAsagn0GNLZG6nL5bn2NedJVXCLnt4JaPRFA==");
misty.Set("azureURL1","https://storageaccountmistyadc2.blob.core.windows.net/outcontainer/TTSOutput.wav");


misty.RegisterEvent("FaceRecognition", "FaceRecognition", 250);
misty.StartFaceRecognition();

function _FaceRecognition(data) {
    misty.Debug("Face Recognition Event Triggered");
    
    // Play an audio clip
    //misty.PlayAudio("s_Love.wav");

    //misty.Debug("Play Audio");

    // Change LED to white
	misty.ChangeLED(255, 255, 255);
	
    // Stop face detection
    misty.StopFaceRecognition();

    // Use this to help debug issues!
    misty.Debug(JSON.stringify(data));
	var name = data.PropertyTestResults[0].PropertyParent.PersonName;
	misty.Debug("I recognize: " + name);

    misty.DisplayImage("e_Love.jpg");

	let azureURL = misty.Get("azureURL");
	let azureURL1 = misty.Get("azureURL1");

	//create the text to speech request
	try {
		misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name + "\"", null, null, "{}", false, false, "", "application/json");
		//misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name);
	}
	catch (err) {
		misty.Debug(`Send External failed: ${err}`);
	}

	misty.Pause(7000);
	misty.SendExternalRequest("GET", azureURL1, null, null, "{}", true, true, "TTSOutput.wav", "audio/x-wav");

    //misty.Pause(10000)
};

function _SendExternalRequest(data) {
	
	misty.Debug("Response Received");
	misty.Debug(JSON.stringify(data));

	if (data !== undefined && data !== null) {
		misty.Debug(JSON.stringify(data.Result.ResponseObject.Data));
	}
	else {
		misty.Debug("ERROR: Empty user callback data");
	}
	misty.Pause(3000);
    misty.ChangeLED(0, 0, 0);
    misty.DisplayImage("e_Admiration.jpg");
}