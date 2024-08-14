import AWS from 'aws-sdk';

// Configure AWS SDK
const S3 = new AWS.S3({
    endpoint: import.meta.env.AWS_URL, // Use only if needed
    accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.AWS_DEFAULT_REGION,
});

export default S3;
