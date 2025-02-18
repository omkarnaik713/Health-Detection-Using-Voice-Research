const mic_btn = document.querySelector('#mic');

mic_btn.addEventListener('click',ToggleMic);
let can_record = false;
let is_recording = false;

let recorder = null;
let chunks = [];

function SetupAudio(){
    console.log('Setup')
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices
        .getUserMedia({
            audio:true
        })
        .then(SetupStrean)
        .catch(err => {
            console.error(err)
        });
    }
}
SetupAudio();

function SetupStrean(stream) {
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    }
    recorder.onstop = e => {
        const blob = new Blob(chunks , {'type' : "audio/wav"});
        chunks = [];
        sendDataToServer(blob);

        console.log("Captured Audio Information:");
        console.log(" - Blob size:", blob.size, "bytes");  // Blob size
        console.log(" - Blob type:", blob.type); 
    }
    can_record = true;
}
function ToggleMic(){
    if(!can_record)return;

    is_recording = !is_recording;

    if(is_recording){
        recorder.start();
        mic_btn.classList.add("is-recording");
    }else {
        recorder.stop();
        mic_btn.classList.remove("is-recording")
    }
}
function sendDataToServer(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav'); // Ensure file extension matches

    fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.text(); // Handle plain text response
    })
    .then(data => {
        console.log('Upload Successful', data);
        alert(`Server Response: ${data}`);
    })
    .catch(error => {
        console.error('Error Uploading File', error);
        alert('Error Uploading File: ' + error.message);
    });
}
