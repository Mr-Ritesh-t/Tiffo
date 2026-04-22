/**
 * Cloudinary Configuration
 */
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dms41nxhb/image/upload";
const UPLOAD_PRESET = "Tiffo project";

/**
 * Uploads a file to Cloudinary.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} - The public secure URL.
 */
export async function uploadFile(file) {
  if (!file) throw new Error('No file provided')
  
  // Validation: 5MB limit (Cloudinary Free has limits too)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.')
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Return the HTTPS URL
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw new Error('Failed to upload image to Cloudinary. Check your Preset settings.');
  }
}

/**
 * Unsigned uploads do not support client-side deletion for security.
 * Function kept for interface compatibility. 
 */
export async function deleteFile(url) {
  console.log('Client-side delete not supported for unsigned Cloudinary uploads:', url);
  return Promise.resolve();
}
