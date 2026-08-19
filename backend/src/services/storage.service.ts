import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import logger from '../utils/logger'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'firstbridge-media'

// Initialize S3 Client scoped for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
})

export const storageService = {
  /**
   * Upload video buffer to Cloudflare R2
   */
  async uploadVideo(buffer: Buffer, key: string, contentType: string = 'video/mp4'): Promise<string> {
    logger.info(`Uploading video file to R2: ${key}`)
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })

      await r2Client.send(command)
      logger.info(`Successfully uploaded video to R2: ${key}`)
      return key
    } catch (error) {
      logger.error(`Failed uploading video to R2 (${key}):`, error)
      throw error
    }
  },

  /**
   * Generate a secure presigned GET URL for an object in R2
   */
  async getPresignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })

      const url = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds })
      return url
    } catch (error) {
      logger.error(`Failed generating presigned URL for R2 key (${key}):`, error)
      throw error
    }
  },

  /**
   * Delete an object from R2
   */
  async deleteFile(key: string): Promise<void> {
    logger.info(`Deleting file from R2: ${key}`)
    try {
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })

      await r2Client.send(command)
      logger.info(`Successfully deleted file from R2: ${key}`)
    } catch (error) {
      logger.error(`Failed deleting file from R2 (${key}):`, error)
      throw error
    }
  },
}
