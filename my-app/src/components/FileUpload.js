import React, { useRef, useEffect } from 'react';
import '../styles/FileUpload.css'; // Assuming you have a CSS file for styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import CryptoJS from 'crypto-js';

function FileUpload({ uploadData, setUploadData }) {
  const fileInput = useRef(null);

  const handleClick = () => {
    fileInput.current.click();
  }

  function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
   
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  const generateUniqueKey = (filename) => {
    const data = `${filename}-${Date.now()}`;
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  };
  const getUniqueFileName = (fileName, uploadData) => {
    let newFileName = fileName;
    let counter = 1;
    
    while (uploadData.some(data => data.name === newFileName)) {
        console.log("Conflict with:", newFileName); 
        const splitName = fileName.lastIndexOf(".");
        const baseName = fileName.substring(0, splitName);
        const extension = fileName.substring(splitName);
        newFileName = `${baseName} (${counter})${extension}`;
        counter++;
    }
    
    return newFileName;
};

  const handleRemove = (fileName) => {
    const updatedUploadData = uploadData.filter(data => data.name !== fileName);
    setUploadData(updatedUploadData);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  useEffect(() => {
    console.log(uploadData);
  }, [uploadData]);

  const handleChange = async (event) => {
    if (uploadData.length >= 10) {
      alert("You can upload a maximum of 10 files.");
      return;
    }
    var file = event.target.files[0];
    console.log(file);
    // Convert to base64
    const base64 = await convertToBase64(file);

    if (file) {
      var fileName = file.name;
      fileName = getUniqueFileName(fileName, uploadData);
      console.log(file);
      var splitName = fileName.split('.');
      var fileExtension = splitName[splitName.length - 1];
      

      var fileSize = formatFileSize(file.size);
      const uniqueKey = generateUniqueKey(file.name);

      // Append the base64 representation of the file to uploadData state
      setUploadData(prevData => [...prevData, {
        name: fileName,
        base64: base64,
        key: uniqueKey,
        file: file,
        extension: fileExtension,
        progress: 50,
        fileSize: fileSize,
        status: 'Pending'
      }]);
      
      uploadFile(file, fileName, base64);
    }

  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function downloadBase64File(base64Data, fileName) {
    const blobData = base64ToBlob(base64Data, 'text/plain'); // replace 'type_here' with the appropriate MIME type
    const url = window.URL.createObjectURL(blobData);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
}

function base64ToBlob(base64, type = '') {
  // Remove the Data URI prefix
  const pureBase64 = base64.split(',')[1];

  const byteCharacters = atob(pureBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: type });
}


  const uploadFile = (file, name) => {
    var formData = new FormData();
    formData.append('file', file, name);

    setUploadData(prevData => {
      return prevData.map(data => {
          if (data.name === name) {
              return {
                  ...data,
                  progress: 100,
                  status: "Uploaded",
              };
          }
          return data;
      });
  });
  }

  return (
    <div className="wrapper">
      <header>Upload Files Here</header>

      {/* Handle click area */}
      <form onClick={handleClick}>
        <input ref={fileInput} className="file-input" type="file" name="file" hidden onChange={handleChange} />
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        <p>Browse File to Upload</p>
      </form>

      {/* Dynamic file visualizer section */}
      <section className="progress-area">
    {Object.keys(uploadData).filter(name => uploadData[name].status !== 'Uploaded').map(name => (
      <div key={name} className="row">
        <FontAwesomeIcon icon={faFileAlt} />
        <div className="content">
          <div className="details">
            <span className="name">{name} • {uploadData[name].status}</span>
            <span className="percent">{uploadData[name].progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{width: `${uploadData[name].progress}%`}}></div>
          </div>
        </div>
      </div>
    ))}
</section>

<section className="uploaded-area">
    {Object.keys(uploadData).filter(name => uploadData[name].status === 'Uploaded').map(name => (
      <div key={name} className="row">
        <div className="content upload">
          <FontAwesomeIcon icon={faFileAlt} />
          <div className="details">
            <span className="name">{uploadData[name].name} • Uploaded {<FontAwesomeIcon icon={faCheck} />}</span>
            <span className="size">{uploadData[name].fileSize}</span>
            
          </div>
          
        </div>
        <FontAwesomeIcon 
            icon={faTimes} 
            className="remove-icon" //remove
            onClick={() => handleRemove(uploadData[name].name)} 
          />
      </div>
    ))}
</section>
    </div>
  );
};

export default FileUpload;