const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fileUpload = require('express-fileupload');
const rimraf = require('rimraf');
const defaultFilePath = 'C:/Users/admin/wavesurfer_app/my_directory/markers.json';
const app = express();
app.use(express.json());
const PORT = 3000;
const fs = require('fs');
const usedListSaveDirectory = 'C:/Users/admin/wavesurfer_app';

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

function saveUsedListFile(file, directory) {
    // Create the full path for the file
    const filePath = path.join(directory, file.name);
    // Write the file data to the new path
    fs.writeFileSync(filePath, file.data);
    console.log('UsedList.txt saved successfully.');
    return filePath; // Return the path of the saved file
}

function saveUsedListFile(file) {
    // Create the full path for the file in the new directory
    const filePath = path.join(usedListSaveDirectory, file.name);
    // Write the file data to the new path
    fs.writeFileSync(filePath, file.data);
    console.log('UsedList.txt saved successfully.');
}

app.post('/upload-folder', (req, res) => {
    const folderName = req.body.folderName || "uploadedFiles";
    // Use the directory from the constant above for UsedList.txt
    const savePath = path.join(__dirname, folderName);

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedFiles = req.files.uploadedFiles;

    if (!Array.isArray(uploadedFiles)) {
        uploadedFiles = [uploadedFiles];
    }

    // Ensure the save directory for other files exists
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }

    uploadedFiles.forEach(file => {
        // Check if the file is UsedList.txt and save it using the separate function
        if (file.name === 'UsedList.txt') {
            saveUsedListFile(file);
        } else {
            // Handle other files normally, save them in the uploadedFiles directory
            file.mv(path.join(savePath, file.name), err => {
                if (err) {
                    return res.status(500).send(err);
                }
                console.log(`File saved in directory: ${savePath}`);
            });
        }
    });

    res.send('Files uploaded successfully!');
});

app.post('/run-python', (req, res) => {
    
    const  {language} = req.body;
    //console.log(language);
    const pythonProcess = spawn('python3', ["C:/Users/admin/wavesurfer_app/main_console.py",'--lang', language]); // specify the path to your python script
    
    let output = '';
    let hasError = false;

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        output += data.toString();
        hasError = true;
    });

    pythonProcess.on('close', (code) => {
        console.log("finished of python script"); // Printing the message when the python script execution is finished
        if (hasError) {
            res.status(500).send(output);
        } else {
            res.send(output);
        }
    });
});


app.use(express.static(path.join(__dirname, 'public')));

app.get('/get-json', (req, res) => {
    const filePath = 'C:/Users/admin/wavesurfer_app/markers.json'; // Concrete file path
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send(data);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
