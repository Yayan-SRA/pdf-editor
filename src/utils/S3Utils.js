import S3 from '../AwsConfig'; // Import the configured S3 instance

/**
 * Retrieves a file from AWS S3.
 * @param {string} fileName - The key (path/name) of the file in the S3 bucket.
 * @returns {Promise<string|Buffer>} - The content of the file.
 */
export const getFileFromS3 = async (fileName) => {
  const params = {
    Bucket: import.meta.env.VITE_AWS_BUCKET,
    Key: fileName,  // The name of the file in the S3 bucket
  };

  try {
    const data = await S3.getObject(params).promise();
    return data.Body;  // For binary data, return as Buffer; for text, use .toString('utf-8')
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw error;  // Rethrow or handle the error as needed
  }
};
