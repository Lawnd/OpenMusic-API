const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../../utils/config');

class StorageService {
  constructor() {
    this._S3 = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
  }

  async writeFile(file, meta) {
    const parameter = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    });

    return new Promise((resolve, reject) => {
      const url = this.createPreSignedUrl({
        bucket: config.s3.bucketName,
        key: meta.filename,
      });
      this._S3.send(parameter, (error) => {
        if (error) {
          return reject(error);
        }

        return resolve(url);
      });
    });
  }

  createPreSignedUrl({ bucket, key }) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this._S3, command);
  }

  async deleteFile(key) {
    const params = new DeleteObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
    });

    await this._S3.send(params);
  }
}

module.exports = StorageService;
