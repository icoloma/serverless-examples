This is not an official Google Project.

This project contains an example of a trigger using Cloud Functions from a bucket on GCP.

More details available at 
* https://cloud.google.com/functions/docs/tutorials/imagemagick
* https://github.com/firebase/functions-samples/blob/master/generate-thumbnail/functions/index.js

To run the demo:

```bash
# (once in life) Create your staging bucket (for the GCF code) and bucket for images
gsutil mb gs://icoloma42-functions
gsutil mb gs://icoloma42-test

# (otherwise) clean previous test
gsutil rm gs://icoloma42-functions/thumbnails/google-self-driving-bike.jpg

# leave this open in a tab
watch gsutil ls -R gs://icoloma42-functions/

# Connect the function to the bucket
gcloud functions deploy generateThumbnail --runtime nodejs8 --stage-bucket icoloma42-test --trigger-bucket icoloma42-functions 

# (While running) Review the function in index.js in an editor

# copy the image, see how the thumbnail gets created
gsutil cp google-self-driving-bike.jpg gs://icoloma42-functions/uploads/

# Open the original image and thumbnail in the browser
google-chrome --incognito google-self-driving-bike.jpg http://storage.googleapis.com/icoloma42-functions/thumbnails/google-self-driving-bike.jpg

# Open the trigger and review in the console
xdg-open https://console.cloud.google.com/functions/list

# (optional) see the logs
gcloud logging read projects/icoloma-42/logs/cloudfunctions.googleapis.com%2Fcloud-functions
gcloud alpha functions logs read generateThumbnail
```
