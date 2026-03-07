"""
Cloud storage service for audio files (Google Cloud Storage or AWS S3)
"""
from google.cloud import storage
from ..config import settings
import logging
import uuid

logger = logging.getLogger(__name__)

if settings.STORAGE_TYPE == "gcs":
    client = storage.Client()
    bucket = client.bucket(settings.STORAGE_BUCKET)


async def upload_audio(audio_bytes: bytes, filename: str) -> str:
    """
    Upload audio file to cloud storage
    Returns: Public URL of uploaded file
    """
    try:
        if settings.STORAGE_TYPE == "gcs":
            # Google Cloud Storage
            blob = bucket.blob(f"audio/{filename}")
            blob.upload_from_string(audio_bytes, content_type="audio/mpeg")
            blob.make_public()
            
            url = blob.public_url
            logger.info(f"Uploaded audio to GCS: {url}")
            return url
        
        elif settings.STORAGE_TYPE == "s3":
            # AWS S3 (implement if needed)
            import boto3
            s3 = boto3.client('s3')
            s3.put_object(
                Bucket=settings.STORAGE_BUCKET,
                Key=f"audio/{filename}",
                Body=audio_bytes,
                ContentType="audio/mpeg"
            )
            url = f"https://{settings.STORAGE_BUCKET}.s3.amazonaws.com/audio/{filename}"
            logger.info(f"Uploaded audio to S3: {url}")
            return url
        
        else:
            raise ValueError("Invalid STORAGE_TYPE in settings")
    
    except Exception as e:
        logger.error(f"Storage upload error: {str(e)}")
        raise Exception(f"Failed to upload audio: {str(e)}")