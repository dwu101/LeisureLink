import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Alert from './Alert';

const ProfilePictureUpload = ({setIsChanged}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const username = sessionStorage.getItem('username');
  
  const imgRef = useRef(null);

  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
          height: 90, // Added fixed height
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result);
        setCrop(undefined);
        setCroppedImage(null);
        setIsChanged(true);
      });
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
    // Set completedCrop immediately since we won't allow resizing
    setCompletedCrop(crop);
  }

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });
  
  const getCroppedImg = async () => {
    try {
      const image = await createImage(imgSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      if (!ctx || !completedCrop) {
        throw new Error('No crop data available');
      }
  
      // Set canvas size to be a square based on the smallest dimension of the crop
      const size = Math.min(completedCrop.width, completedCrop.height);
      canvas.width = size;
      canvas.height = size;
  
      // Calculate scaling factors
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
  
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Create a circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.clip();
  
      // Draw the image centered within the circular clip
      const drawX = (completedCrop.x * scaleX) + (completedCrop.width * scaleX - size) / 2;
      const drawY = (completedCrop.y * scaleY) + (completedCrop.height * scaleY - size) / 2;
  
      ctx.drawImage(
        image,
        drawX,
        drawY,
        size * scaleX,
        size * scaleY,
        0,
        0,
        size,
        size
      );
  
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          }
        }, 'image/png', 1); // Using PNG for better quality with transparency
      });
    } catch (error) {
      console.error('Error creating cropped image:', error);
      throw error;
    }
  };

  const handleCropConfirm = async () => {
    try {
      if (!imgSrc || !completedCrop) return;
      
      const croppedImageUrl = await getCroppedImg();
      setCroppedImage(croppedImageUrl);
      // handleUpload()
    } catch (error) {
      console.error('Error confirming crop:', error);
    }
  };

  const handleUpload = async () => {
    if (!croppedImage) return;

    setUploading(true);
    setUploadError(null);
    
    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      // const timestamp = new Date().getTime();
      const file = new File([blob], `profile_${username}.jpg`, { type: 'image/jpeg' });
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      setConfirmed(true);
      setIsChanged(false);

      const data = await uploadResponse.json();
      console.log('Upload successful. Image path:', data.imagePath);

      // try {
      console.log("AAA")
      console.log(username)
      console.log(data.imagePath)
      const response2 = await fetch('/changePFP', {  // Replace with your actual endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          newPFPLink: data.imagePath
        })
      });
  
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }
  
      const data2 = await response2.json();
      return data2;

      
      


      
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Error uploading image');
      setAlertType('error');
      setAlertMessage('Failed to upload image. Please try again.');
      setShowAlert(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {!imgSrc && (
        <div className="mb-6">
          <label className="block text-center w-full cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500">Set/change profile picture</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onSelectFile}
                  style={{marginLeft: "30px"}}
                />
              </div>
            </div>
          </label>
        </div>
      )}

      {imgSrc && !croppedImage && (
        <div className="flex flex-col gap-4">
          <div className="relative w-full h-96">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => {
                // Only update the position, maintain the size
                setCrop(prev => ({
                  ...prev,
                  x: percentCrop.x,
                  y: percentCrop.y
                }));
                setCompletedCrop(prev => ({
                  ...prev,
                  x: percentCrop.x,
                  y: percentCrop.y
                }));
              }}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-full"
              locked={true}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-full mx-auto"
              />
            </ReactCrop>
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
            type="button"
              onClick={() => {
                setImgSrc(null);
                setSelectedFile(null);
              }}
              className="bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            
            <button 
            type="button"
              onClick={handleCropConfirm}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Confirm Crop
            </button>
          </div>
        </div>
      )}

      {croppedImage && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-center">Preview</h3>
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-200">
            <img
              src={croppedImage}
              alt="Cropped preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <button
            type="button"
              onClick={() => {
                setCroppedImage(null);
                setImgSrc(null);
                setConfirmed(false);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reupload
            </button>
            {!confirmed &&
              <button
              type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Confirm and Update'}
              </button>
            }
            {confirmed &&
              <p>New Profile Pic Updated! </p>
            }
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {uploadError}
        </div>
      )}

      <Alert
        show={showAlert}
        type={alertType}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default ProfilePictureUpload;