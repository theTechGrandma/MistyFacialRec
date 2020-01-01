misty.Debug("Announce Know Person Skill");
misty.Set("azureURL","https://mistyspeech-tam.azurewebsites.net/api/HttpTrigger1?code=FaBOOiaNLheDTeSXwrwAsagn0GNLZG6nL5bn2NedJVXCLnt4JaPRFA==");
//misty.Set("url", "http://www.moviesoundclips.net/download.php?id=2631&ft=wav");
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
	//let url = misty.Get("url");
	let azureURL1 = misty.Get("azureURL1");
	//misty.SendExternalRequest("GET", url, null, null, "{}", true, true, "downloadAudio.wav");
	//misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name + "\"", null, null, "text/plain", "{}");
	//create the text to speech request
	try {
		misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name + "\"", null, null, "{}", false, false, "", "application/json");
		//misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name);
	}
	catch (err) {
		misty.Debug(`Send External failed: ${err}`);
	}
	misty.Pause(7000);
	//misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name + "\"", null, null, "{}", true, true, "https://storageaccountmistyadc2.blob.core.windows.net/outcontainer/TTSOutput.wav");
	//misty.SendExternalRequest("GET", azureURL + "?message=Hi there " + name + "\"", null, null, "{}", true, true, azureURL1);
	
	//play the soundfile
	//misty.SendExternalRequest("GET", azureURL1, null, null, "{}", true, true, "downloadAudio.wav", "audio/x-wav");
	misty.SendExternalRequest("GET", azureURL1, null, null, "{}", true, true, "TTSOutput.wav", "audio/x-wav");
	//misty.SendExternalRequest("GET", azureURL1, null, null);

    //misty.Pause(10000)
};

function _SendExternalRequest(data) {
	
	//misty.Debug("Response Received");
	misty.Debug(JSON.stringify(data));

	if (data !== undefined && data !== null) {
		misty.Debug("Recieved Response from Azure");
		misty.Debug(JSON.stringify(data.Result.ResponseObject.Data));
		//misty.SaveAudio("AzureResponse.wav", base64ToByteArrayString(data.Result.ResponseObject.Data), true, true);
		// misty.SaveAudio("TTSOutput.wav", data.Result.ResponseObject.Data, true, true);
        // misty.Pause(7000);
		// misty.PlayAudio("TTSOutput.wav");
		// misty.Debug("Did I play a wav file?");
	}
	else {
		misty.Debug("ERROR: Empty user callback data");
	}
	misty.Pause(3000);
    misty.ChangeLED(0, 0, 0);
    misty.DisplayImage("e_Admiration.jpg");
}

function base64ToByteArrayString(input) {
    misty.Debug("Converting base64 String");
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var Base64 = {
		btoa: (input) => {
			let str = input;
			let output = '';

			for (let block = 0, charCode, i = 0, map = chars;
				str.charAt(i | 0) || (map = '=', i % 1);
				output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

				charCode = str.charCodeAt(i += 3 / 4);

				if (charCode > 0xFF) {
					throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
				}

				block = block << 8 | charCode;
			}

			return output;
		},

		atob: (input) => {
			let str = input.replace(/=+$/, '');
			let output = '';

			if (str.length % 4 == 1) {
				throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
			}
			for (let bc = 0, bs = 0, buffer, i = 0;
				buffer = str.charAt(i++);

				~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
					bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
			) {
				buffer = chars.indexOf(buffer);
			}

			return output;
		}
	}
	try {
		var byteCharacters = Base64.atob(input);
		var bytesLength = byteCharacters.length;
		var bytes = new Uint8Array(bytesLength);
		for (var offset = 0, i = 0; offset < bytesLength; ++i, ++offset) {
			bytes[i] = byteCharacters[offset].charCodeAt(0);
		}
		return bytes.toString();
	} catch (e) {
		misty.Debug("ERROR: Couldn't convert string to byte array: " + e);
		return undefined;
	}
}