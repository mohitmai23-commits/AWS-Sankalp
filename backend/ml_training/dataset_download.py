"""
Dataset download utilities for EdNet
"""
import os
import urllib.request
import zipfile
import logging

logger = logging.getLogger(__name__)


def download_ednet_kt1():
    """
    Download EdNet-KT1 dataset for cognitive load training
    
    Dataset: https://github.com/riiid/ednet
    Direct link: https://github.com/riiid/ednet/releases/download/v1.0/KT1.zip
    """
    dataset_url = "https://github.com/riiid/ednet/releases/download/v1.0/KT1.zip"
    data_dir = "data/ednet"
    os.makedirs(data_dir, exist_ok=True)
    
    zip_path = os.path.join(data_dir, "KT1.zip")
    extract_path = os.path.join(data_dir, "KT1")
    
    if os.path.exists(extract_path):
        logger.info("EdNet-KT1 dataset already exists")
        return extract_path
    
    logger.info("Downloading EdNet-KT1 dataset...")
    urllib.request.urlretrieve(dataset_url, zip_path)
    
    logger.info("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    
    os.remove(zip_path)
    logger.info(f"EdNet-KT1 dataset ready at: {extract_path}")
    return extract_path


def download_ednet_kt3():
    """
    Download EdNet-KT3 dataset for memory retention training
    
    Dataset: https://github.com/riiid/ednet
    Direct link: https://github.com/riiid/ednet/releases/download/v1.0/KT3.zip
    """
    dataset_url = "https://github.com/riiid/ednet/releases/download/v1.0/KT3.zip"
    data_dir = "data/ednet"
    os.makedirs(data_dir, exist_ok=True)
    
    zip_path = os.path.join(data_dir, "KT3.zip")
    extract_path = os.path.join(data_dir, "KT3")
    
    if os.path.exists(extract_path):
        logger.info("EdNet-KT3 dataset already exists")
        return extract_path
    
    logger.info("Downloading EdNet-KT3 dataset...")
    urllib.request.urlretrieve(dataset_url, zip_path)
    
    logger.info("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    
    os.remove(zip_path)
    logger.info(f"EdNet-KT3 dataset ready at: {extract_path}")
    return extract_path