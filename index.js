const config = require('./config.js')
const AWS = require('aws-sdk');
const fs = require('fs');

exports.handler = async (event) => {
  try {
    if (typeof event.file_extension === 'undefined' || event.file_extension === null || event.file_extension.length < 1) {
      return { error: "file_extension is null or not exist" };
    }
    if (typeof event.buffer === 'undefined' || event.buffer === null || event.buffer.length < 1) {
      return { error: "buffer is null or not exist" };
    }
    if (Number.isInteger(event.time_signed_in_seconds) === false || event.time_signed_in_seconds < 1 || typeof event.time_signed_in_seconds === 'undefined' || event.time_signed_in_seconds === null || event.time_signed_in_seconds.length < 1) {
      return { error: "time_signed_in_seconds must be an integer at least 1 and must not be null" };
    }
    if (Number.isInteger(event.time_Lifecycle_in_days) === false || event.time_Lifecycle_in_days < 1 || typeof event.time_Lifecycle_in_days === 'undefined' || event.time_Lifecycle_in_days === null || event.time_Lifecycle_in_days.length < 1) {
      return { error: "time_Lifecycle_in_days must be an integer at least 1 and must not be null" };
    }
    const s3 = new AWS.S3({
      accessKeyId: config.AWS_KEY,
      secretAccessKey: config.AWS_SECRET
    }), fileName = uuidv4(), signedUrlExpireSeconds = event.time_signed_in_seconds, expirationDays = event.time_Lifecycle_in_days, extensionFile = event.file_extension, response = {};
    const finalURL = await getURL(s3, event, fileName, extensionFile, signedUrlExpireSeconds);

    lifeCycle(s3, event, fileName, extensionFile, expirationDays, signedUrlExpireSeconds);
    const getURLOfObject = await uploadToS3(s3, event, fileName, extensionFile, signedUrlExpireSeconds, finalURL);
    return {
      statusCode: 200,
      url: getURLOfObject.sharedURL,
    };

  } catch (error) {
    console.log(error);
  }
};




const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const uploadToS3 = async (s3, event, fileName, extensionFile, signedUrlExpireSeconds, finalURL) => {
  const data = await s3.upload({
    Bucket: config.AWS_BUCKET,
    Key: event.chatbot.toLowerCase() + fileName + extensionFile,
    Body: Buffer.from(event.buffer, config.ENCODE_BASE)
  }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      try {
        console.log("upload correct");
        data.finalURL = finalURL;
      } catch (error) {
        return { "error": error };
      }

    }
  }).promise()
  data.sharedURL = finalURL;
  console.log("Final Data");
  console.log(data);
  return data
}

function lifeCycle(s3, event, fileName, extensionFile, expirationDays, signedUrlExpireSeconds) {
  s3.putBucketLifecycleConfiguration({
    Bucket: config.AWS_BUCKET,
    LifecycleConfiguration: {
      Rules: [
        {
          Expiration: {
            Days: expirationDays,
          },
          Filter: {
            Prefix: event.chatbot.toLowerCase() + fileName + extensionFile,
          },
          Status: 'Enabled',
        },
      ],
    },
  }, function (err, data) {
    if (err) { console.log(err, err.stack); }
    else {
      console.log("putBucketLifecycleConfiguration correct.");
      // getURL(s3,event,fileName,extensionFile,signedUrlExpireSeconds)
    }

  })
}

async function getURL(s3, event, fileName, extensionFile, signedUrlExpireSeconds) {
  const signedURL = s3.getSignedUrl('getObject', {
    Bucket: config.AWS_BUCKET,
    Key: event.chatbot.toLowerCase() + fileName + extensionFile,
    Expires: signedUrlExpireSeconds
  });

  return signedURL;
}

function reToRUL(data) {
  console.log(data);
}

