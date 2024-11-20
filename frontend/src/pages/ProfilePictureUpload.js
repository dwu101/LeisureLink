import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
import Alert from '../components/Alert';

const ProfilePictureUpload = () => {
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
  
  const imgRef = useRef(null);

  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
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
        
        // Reset crop state when new image is loaded
        setCrop(undefined);
        setCroppedImage(null);
      });
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
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

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Create circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        0,
        2 * Math.PI,
        true
      );
      ctx.fill();

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          }
        }, 'image/jpeg');
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
      const timestamp = new Date().getTime();
      const file = new File([blob], `profile_${timestamp}.jpg`, { type: 'image/jpeg' });
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        setAlertType('error');
        setAlertMessage('Failed to update profile. Please try again.');
        setShowAlert(true);
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await uploadResponse.json();
      console.log('Upload successful. Image path:', data.imagePath);
      setAlertType('success');
      setAlertMessage('Profile updated successfully!');
      setShowAlert(true);
      
      // Clear the form
      setSelectedFile(null);
      setImgSrc(null);
      setCroppedImage(null);
      setCrop(undefined);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Error uploading image');
      setAlertType('success');
      setAlertMessage('Profile updated successfully!');
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
                {/* <div className="w-12 h-12 text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div> */}
                <span className="text-sm text-gray-500">Click to upload profile picture</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onSelectFile}
              />
            </div>
          </label>
        </div>
      )}

      {imgSrc && !croppedImage && (
        <div className="flex flex-col gap-4">
          <div className="relative w-full h-96">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-full"
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
              onClick={() => {
                setImgSrc(null);
                setSelectedFile(null);
              }}
              className="bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            
            <button 
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
              onClick={() => {
                setCroppedImage(null);
                setImgSrc(null);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
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