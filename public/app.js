
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'violet',
  progressColor: 'purple',
  plugins: [
      WaveSurfer.regions.create(), // Initialize the Regions plugin
  ]
});

let audioStarted = false;
wavesurfer.on('audioprocess', function () {
  const currentTime = wavesurfer.getCurrentTime();
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
  const timelineElement = document.getElementById('timeline');
  
  timelineElement.textContent = `${minutes}:${seconds}`;
});

wavesurfer.on('ready', function () {
    const totalDuration = wavesurfer.getDuration();
    const minutes = Math.floor(totalDuration / 60);
    const seconds = Math.floor(totalDuration % 60).toString().padStart(2, '0');
    const timelineElement = document.getElementById('timeline');
    
    // Directly setting the total duration part of the timeline content
    timelineElement.textContent = `0:00 / ${minutes}:${seconds}`;
});


function togglePlayPause() {
  wavesurfer.playPause();
  
  // Toggle the playing class on the play-pause button
  const playPauseButton = document.querySelector('.play-pause-button');
  playPauseButton.classList.toggle('playing');
}


function increaseVolume() {
  let currentVolume = wavesurfer.getVolume();
  if (currentVolume < 1) { 
      wavesurfer.setVolume(currentVolume + 0.1); 
  }
}

function decreaseVolume() {
  let currentVolume = wavesurfer.getVolume();
  if (currentVolume > 0) { 
      wavesurfer.setVolume(currentVolume - 0.1); 
  }
}

function loadAudio() {
  const audioFile = document.getElementById('audioFile').files[0];
  const objectURL = URL.createObjectURL(audioFile);
  wavesurfer.load(objectURL);
}

function zoomIn() {
  const currentZoom = wavesurfer.params.minPxPerSec;
  setZoom(currentZoom + 10);
}

function zoomOut() {
  const currentZoom = wavesurfer.params.minPxPerSec;
  setZoom(currentZoom - 10);
}

function setZoom(value) {
  wavesurfer.zoom(Number(value));
  document.getElementById('zoomSlider').value = value; // Update the slider value if setZoom is called from zoomIn or zoomOut
}

function backwardOneSecond() {
  let currentTime = wavesurfer.getCurrentTime();
  if (currentTime > 1) {
      wavesurfer.seekTo((currentTime - 1) / wavesurfer.getDuration());
  } else {
      wavesurfer.seekTo(0);
  }
}

function forwardOneSecond() {
  let currentTime = wavesurfer.getCurrentTime();
  if (currentTime < wavesurfer.getDuration() - 1) {
      wavesurfer.seekTo((currentTime + 1) / wavesurfer.getDuration());
  } else {
      wavesurfer.seekTo(1); // go to the end
  }
}

function addMarker() {
  const currentTime = wavesurfer.getCurrentTime();
  const name = prompt('Enter a name for the marker:', '');
  // Create a marker region
  const markerRegion = wavesurfer.regions.add({
    start: currentTime,
    end: currentTime + 2, // Set the marker duration (in seconds)
    drag: true, // Enable dragging for the marker
    resize: true, // Enable resizing for the marker
    color: 'rgba(255, 0, 0, 0.3)', // Marker color
    data: { name: name }
  });

  // Handle marker click to seek to its position
  markerRegion.on('click', () => {
    wavesurfer.seekTo(markerRegion.start);
  });

  // Handle marker double-click to delete the region
  markerRegion.on('dblclick', () => {
    markerRegion.remove();
  });
  if (name) {
    // Create a new label element
    const label = document.createElement('span');
    label.innerText = name;
    label.style.position = 'absolute';
    label.style.bottom = '0';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.background = 'rgba(255, 255, 255, 0.7)';
    label.style.padding = '2px';
    label.style.borderRadius = '2px';
    label.style.fontSize = '10px';

    // Append the label to the marker's element
    markerRegion.element.appendChild(label);
  }
}

function addMarkerAtTime() {
  // Create a marker region at the specified time with zero duration
  const currentTime = wavesurfer.getCurrentTime();
  const name = prompt('Enter a name for the marker:', '');
  const markerRegion = wavesurfer.regions.add({
    start: currentTime, 
    end: currentTime,
    drag: true, // Enable dragging for the marker
    resize: false, // Enable resizing for the marker
    color: 'rgba(255, 0, 0, 0.3)', // Marker color
    data: { name: name }
  });

  // Handle marker click to seek to its position
  markerRegion.on('click', () => {
    wavesurfer.seekTo(markerRegion.start);
  });
  markerRegion.element.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (!markerRegion.data.isGreen) {
      markerRegion.update({color: 'rgba(0, 255, 0, 1)'}); // Change to green
      markerRegion.data.isGreen = true;
    } else {
      markerRegion.update({color: 'rgba(255, 0, 0, 0.3)'}); // Change back to red
      markerRegion.data.isGreen = false;
    }
  });
  markerRegion.on('dblclick', () => {
    markerRegion.remove();
  });
  if (name) {
    markerRegion.element.style.borderLeft = '2px solid rgba(255, 0, 0, 0.5)';  // Thick border on the left
    markerRegion.element.style.height = '100%';  // Cover the full height of the waveform

    // Using a CSS pseudo-element for additional visibility
    const style = document.createElement('style');
    style.innerHTML = `
        .waveform .region:hover::before {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            bottom: 0;
            left: -1px;  // Slightly to the left to center it
            width: 4px;  // Width of the pseudo-element
            background-color: rgba(255, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
    // Create a new label element
    const label = document.createElement('span');
    label.innerText = name;
    label.style.position = 'absolute';
    label.style.bottom = '0';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.background = 'rgba(255, 255, 255, 0.7)';
    label.style.padding = '2px';
    label.style.borderRadius = '2px';
    label.style.fontSize = '10px';

    // Append the label to the marker's element
    markerRegion.element.appendChild(label);
  }
   
}
function loadUploadedAudio() {
  const audioFile = document.getElementById('audioFile').files[0];
  if (audioFile) {
    const objectURL = URL.createObjectURL(audioFile);
    wavesurfer.load(objectURL);
  }
}
let currentFileIndex = 0;
const soundRecallFiles = [];
let UsedTxt = false;
let usedListContent = '';
let usedListWords = [];
let wordsPerFile = {};

function loadUploadedData() {
    const dataFolder = document.getElementById('dataFolder').files;
    const uploadedFilesDiv = document.getElementById('uploadedFiles');

    uploadedFilesDiv.innerHTML = ''; // Clear previous entries
    soundRecallFiles.length = 0; // Clear previous files
    currentFileIndex = 0; // Reset current file index

    if (dataFolder.length > 0) {
        // Display folder on client side
        const firstFileName = dataFolder[0].webkitRelativePath || dataFolder[0].name;
        const folderName = firstFileName.split('/')[0];

      

        // Find all .wav files starting with "sound_recall"
        for (let i = 0; i < dataFolder.length; i++) {
            const file = dataFolder[i];
            if (file.name.startsWith('sound_recall') && file.name.endsWith('.wav')) {
                soundRecallFiles.push(file); // Add the file to the array
            }
        }
        for (let i = 0; i < dataFolder.length; i++) {
          const file = dataFolder[i];
          if (file.name.startsWith('UsedList') && file.name.endsWith('.txt')) {
              UsedTxt = true; // Add the file to the array    
              const reader = new FileReader();
                reader.onload = function(e) {
                  usedListWords = e.target.result.split(/\s+/);
                  distributeWords();
                  displayWordsForCurrentFile();
                };
                reader.onerror = function() {
                    console.error('Error reading UsedList.txt.');
                };
                reader.readAsText(file);     
              
          }
      }

        if (UsedTxt) {
            uploadedFilesDiv.textContent = 'UsedList.txt is found.';
        }
        if (soundRecallFiles.length > 0) {
          loadFileIntoWaveform(soundRecallFiles[currentFileIndex]);
      } else {
          uploadedFilesDiv.textContent = 'No matching files found.';
      }
    } else {
        uploadedFilesDiv.textContent = 'No files uploaded.';
    }
}
function distributeWords() {
  // Divide the words between the sound_recall files
  soundRecallFiles.forEach((soundFile, index) => {
      const startIndex = index * 15;
      wordsPerFile[soundFile.name] = usedListWords.slice(startIndex, startIndex + 15);
  });
}

function displayWordsForCurrentFile() {
  const wordsDiv = document.getElementById('usedListContent');
  const currentSoundFile = soundRecallFiles[currentFileIndex];
  if (currentSoundFile) {
      const wordsToDisplay = wordsPerFile[currentSoundFile.name] || [];
      wordsDiv.textContent = wordsToDisplay.join(' ');
  }
}

function printUsedListContent() {
  const contentDiv = document.getElementById('usedListContent');
  contentDiv.textContent = usedListContent; // Print the content in the content div
}
function loadFileIntoWaveform(file) {
  const objectURL = URL.createObjectURL(file);
  wavesurfer.load(objectURL);
  
  // Reset the timeline when a new file is loaded
  const timelineElement = document.getElementById('timeline');
  timelineElement.textContent = "0:00"; // Reset the timeline to initial time
  
  // Save the name of the file (without the extension) to the currentFileName variable
  currentFileName = file.name.replace(/\.[^/.]+$/, "");
  
  const fileNameContainer = document.getElementById('currentFileNameContainer');
  fileNameContainer.textContent = `Currently playing: ${file.name}`;
}



function loadNextFile() {
  clearRegions();
    if (currentFileIndex < soundRecallFiles.length - 1) {
        currentFileIndex++;
        loadFileIntoWaveform(soundRecallFiles[currentFileIndex]);
        displayWordsForCurrentFile();
    }
}

function loadPreviousFile() {
  clearRegions();
    if (currentFileIndex > 0) {
        currentFileIndex--;
        loadFileIntoWaveform(soundRecallFiles[currentFileIndex]);
        displayWordsForCurrentFile();
    }
}



// After WaveSurfer is initialized and loaded


function loadRegionsFromFiles() {
  const fileInput = document.getElementById('regionFiles');
  const files = fileInput.files;

  if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          loadRegionsFromFile(file);
      }
  }
}

function loadRegionsFromFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
      const lines = e.target.result.split('\n'); // Split the file content into lines
      for (const line of lines) {
          const [startTimeStr, endTimeStr, name] = line.split(','); // Split each line by comma

          const [startMinutes, startSeconds] = startTimeStr.split(':');
          const start = parseFloat(startMinutes.trim()) * 60 + parseFloat(startSeconds.trim());

          const [endMinutes, endSeconds] = endTimeStr.split(':');
          const end = parseFloat(endMinutes.trim()) * 60 + parseFloat(endSeconds.trim());

          // Add region
          const markerRegion = wavesurfer.regions.add({
              start: start,
              end: end,
              color: 'rgba(255, 0, 0, 0.3)',
              drag: true,
              resize: true,
              data: { name: name.trim() }
          });

          markerRegion.on('click', () => {
              wavesurfer.seekTo(markerRegion.start);
          });

          // Handle marker double-click to delete
          markerRegion.on('dblclick', () => {
              markerRegion.remove();
          });

          if (name) {

              const label = document.createElement('span');
              label.innerText = name.trim();
              label.style.position = 'absolute';
              label.style.bottom = '0';
              label.style.left = '50%';
              label.style.transform = 'translateX(-50%)';
              label.style.background = 'rgba(255, 255, 255, 0.7)';
              label.style.padding = '2px';
              label.style.borderRadius = '2px';
              label.style.fontSize = '10px';
              markerRegion.element.appendChild(label);
          }
      }
  };

  reader.readAsText(file);
}

function printAllRegions() {
  // Get the container where the regions will be printed
  const container = document.getElementById('regionsContainer');
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Get all regions
  const regions = wavesurfer.regions.list;
  
  // Iterate over each region and append its details to the container
  for (const regionId in regions) {
    const region = regions[regionId];
    const name = region.data.name;
    const startTime = formatTime(region.start);
    const endTime = formatTime(region.end);
    const color = region.color;
    
    // Determine the comment based on the region's color
    const comment = color === 'rgba(0, 255, 0, 0.3)' ? 'Correct' : 'Intrusion';
    
    // Create a new div for the region's information
    const regionDiv = document.createElement('div');
    regionDiv.innerHTML = `Name: ${name}, Start Time: ${startTime}, End Time: ${endTime}, Comment: ${comment}`;
    
    // Append the region's information to the container
    container.appendChild(regionDiv);
  }
}

// Helper function to format the time values
function formatTime(time) {
  return new Date(time * 1000).toISOString().substr(14, 5);
}


// Helper function to format time (in seconds) as "m:ss"
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}
// document.getElementById('runPython').addEventListener('click', function() {
//   fetch('/run-python', {
//       method: 'POST'
//   })
//   .then(response => response.text())
//   .then(data => {
//       console.log(data);
//   })
//   .catch((error) => {
//       console.error('Error:', error);
//   });
// });
//const selectedLanguage = document.getElementById('language-select').value;
document.getElementById('runPython').addEventListener('click', function() {
  // Retrieve the selected language from the dropdown
  document.getElementById('statusText').innerText = 'Python script is running';
  const selectedLanguage = document.getElementById('language-select').value;
  const requestBody = {
    language: selectedLanguage
};
  // Send the selectedLanguage as part of the fetch request to the server
  fetch('/run-python', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json', // Indicate that the request body is JSON
      },
      body: JSON.stringify(requestBody)  // Send the language in the request body
      
  })
  .then(response => response.text())
  .then(data => {
      console.log(data);
      // You may want to update the UI with the result here
  })
  .catch((error) => {
      console.error('Error:', error);
      // Handle any errors here, such as updating the UI to reflect the error state
  });
});
// document.getElementById('runPython').addEventListener('click', function() {
//   // Changing the text of the statusText element
//   document.getElementById('statusText').innerText = 'Python script is running';
  
//   fetch('/run-python', {
//       method: 'POST'
//   })
//   .then(response => response.text())
//   .then(data => {
//       console.log(data);
//   })
//   .catch((error) => {
//       console.error('Error:', error);
//   });
// });

function loadRegionsFromServer() {
  fetch('/get-json')
      .then(response => response.json())
      .then(data => {
          loadRegions(data);
      })
      .catch(error => {
          console.error('Error:', error);
      });
}

function loadRegions(jsonData) {
  const item = jsonData[currentFileIndex];
  if (item) {
    const results = item.result || [];
    
    results.forEach(res => {
      const start = res.start;
      const end = res.end;
      const word = res.word;

      if (start < wavesurfer.getDuration() && end <= wavesurfer.getDuration()) {
        const markerRegion = wavesurfer.regions.add({
          start: start,
          end: end,
          color: 'rgba(0, 255, 0, 0.3)',
          drag: true,
          resize: true,
          data: { name: word }
        });

        const label = document.createElement('span');
        label.innerText = word;
        label.style.position = 'absolute';
        label.style.bottom = '0';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = 'rgba(255, 255, 255, 0.7)';
        label.style.padding = '2px';
        label.style.borderRadius = '2px';
        label.style.fontSize = '10px';
        markerRegion.element.appendChild(label);

        let clickTimer = null;

        // Single click event listener for changing the name of the region
        markerRegion.element.addEventListener('click', function() {
          // Clear any ongoing timers
          clearTimeout(clickTimer);

          // Start a timer to detect if it's a single or double click
          clickTimer = setTimeout(function() {
            // If the timer runs out, it's a single click
            const newName = prompt('Enter new name for this region:', markerRegion.data.name);
            if (newName !== null && newName !== markerRegion.data.name) {
              markerRegion.data.name = newName;
              label.innerText = newName;
            }
          }, 300); // Set a timeout period (300 ms is common for double click detection)
        });

        // Double-click event listener for deleting the region
        markerRegion.element.addEventListener('dblclick', function(event) {
          clearTimeout(clickTimer); // Clear the timer to cancel the single click action
          markerRegion.remove(); // Delete the region
        });

        // Keep the contextmenu event listener as it is
        markerRegion.element.addEventListener('contextmenu', function(event) {
          event.preventDefault();
          markerRegion.update({ color: 'rgba(255, 0, 0, 0.3)' });
        });
      }
    });
  }
}




document.getElementById('loadRegionsFromPath').addEventListener('click', function() {
  const endpoint = '/get-default-file'; // URL to your endpoint
  loadRegionsFromPath(endpoint);
});


function clearRegions() {
  Object.keys(wavesurfer.regions.list).forEach((id) => {
    wavesurfer.regions.list[id].remove();
  });
}

function saveRegionsToTextFile() {
  const regions = Object.values(wavesurfer.regions.list);
  let dataString = '';

  regions.forEach(region => {
    const start = region.start;
    const end = region.end;
    const name = region.data.name;
    // Check the region color and assign the comment accordingly
    const comment = region.color === 'rgba(0, 255, 0, 0.3)' ? 'correct' : 'intrusion';
    dataString += `${start},${end},${name},${comment}\n`;
  });
  


  const blob = new Blob([dataString], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  
  // Determine the file name for the download
  let fileName = currentFileName || 'regions';
  if (fileName.indexOf('.') !== -1) {
    // If there's a file extension, insert '_regions' before it
    fileName = fileName.replace('.', '_regions.');
  } else {
    // If there's no file extension, just append '_regions.txt'
    fileName += '_regions.txt';
  }
  link.download = fileName;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up by removing the link
  document.body.removeChild(link);
}






