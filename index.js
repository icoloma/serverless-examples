const path = require('path');
const os = require('os');
const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;

//
// Detects a nw image uploaded to /uploads, scales it down 
// and saves the result to /thumbnails
//
exports.generateThumbnail = (event) => {
  const { name, contentType, resourceState, bucket } = event.data;

  if (
    !contentType.startsWith('image/') || 
    !name.startsWith('uploads/') || 
    resourceState === 'not_exists'
  ) {
    console.log(`File is either a thumbnail, not an image, or is being deleted/moved: name=${name}, state=${resourceState}`);
    return Promise.resolve();
  } else {
    const thumbnailName = name.replace('uploads/', 'thumbnails/')  
    const tempLocalFile = path.join(os.tmpdir(), path.basename(name));
    const tempLocalThumbFile = tempLocalFile + '-thumbnail';

    const gcsBucket = gcs.bucket(bucket);
    const gcsFile = gcsBucket.file(name);
    const gcsThumbFile = gcsBucket.file(thumbnailName);

    // Download file from bucket.
    return gcsFile.download({
      destination: tempLocalFile
    }).then(() => {
      // Generate a thumbnail using ImageMagick.
      console.log('The file has been downloaded to', tempLocalFile);
      return spawn('convert', [tempLocalFile, '-thumbnail', `200x200>`, tempLocalThumbFile], { capture: ['stdout', 'stderr'] });
    }).then(() => {
      // Uploading the Thumbnail.
      console.log('Thumbnail created at', tempLocalThumbFile);
      return gcsBucket.upload(tempLocalThumbFile, { 
        destination: thumbnailName, 
        public: true, 
        metadata: { 
          contentType: contentType
        }
      });
    }).then(() => {
      console.log(`Thumbnail uploaded to ${thumbnailName} and removed from uploads`);
      console.log(`Open http://storage.googleapis.com/icoloma42-functions/${thumbnailName}`)
      return gcsFile.delete();
    });
  }
}