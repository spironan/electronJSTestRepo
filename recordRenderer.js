const { writeFile } = require('fs')

// Renderer process
const { ipcRenderer } = require('electron')

// IPC functions with main
const desktopCapturer = {
  getSources: (opts) => ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts)
}

const Menu = {
    buildFromTemplate: (opts) => ipcRenderer.invoke('MENU_BUILD_FROM_TEMPLATE', opts)
}

// global states
let mediaRecorder;
const recordedChunks = [];

// buttons
const videoElement = document.querySelector('video')

const startBtn = document.getElementById('StartRecordBtn')
startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.innerText = "Recording"
}

const stopBtn = document.getElementById('StopRecordBtn')
stopBtn.onclick = e => {
    mediaRecorder.stop()
    startBtn.innerText = "Start"
}

const selectBtn = document.getElementById('SelectVidBtn')
selectBtn.onclick = getVideoSources

// functions
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    // Create a simplified array of sources containing only necessary properties
    const simplifiedSources = inputSources.map(source => ({
        name: source.name,
        id: source.id
    }));

    // Invoke the menu creation in the main process with the simplified sources
    await ipcRenderer.invoke('CREATE_VIDEO_OPTIONS_MENU', simplifiedSources);
}


ipcRenderer.on('SELECT_SOURCE', async (event, source) => {
    console.log('Selected source:', source);
    // You can now handle the selected source (e.g., start recording)
    selectBtn.innerText = source.name
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }

    // create a stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    // preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play()

    // Create the media Recorder
    const options = { mimeType: "video/mp4" }
    mediaRecorder = new MediaRecorder(stream, options);
    // mediaRecorder = new MediaRecorder(stream)
    // console.log("media recorder mime type is " + mediaRecorder.mimeType)

    // register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.onstop = handleStop

});


function handleDataAvailable(e) {
    console.log('video data available')
    recordedChunks.push(e.data)
}

// Function to handle the stop event
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/mp4',
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    // Request the main process to open the save dialog
    const { filepath } = await ipcRenderer.invoke('SHOW_SAVE_DIALOG', {
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.mp4`
    });

    console.log("filepath selected is " + filepath)
    
    if (filepath) {
        // If the user selected a file path, write the file
        writeFile(filepath, buffer, (err) => {
            if (err) {
                console.error('Error saving video:', err);
            } else {
                console.log('Video saved successfully');
            }
        });
    } else {
        console.log('Save dialog was canceled or no filepath returned');
    }
}

