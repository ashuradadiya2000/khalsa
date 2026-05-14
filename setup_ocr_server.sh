#!/bin/bash

echo "🔧 Setting up OCR dependencies on server..."

# Update package list
sudo apt update

# Install Python3 and pip if not already installed
sudo apt install -y python3 python3-pip

# Install Tesseract OCR and language packs
echo "📦 Installing Tesseract OCR..."
sudo apt install -y tesseract-ocr
sudo apt install -y tesseract-ocr-pan  # Punjabi language pack
sudo apt install -y tesseract-ocr-eng  # English language pack (fallback)

# Install system dependencies for OpenCV
echo "📦 Installing OpenCV dependencies..."
sudo apt install -y libopencv-dev python3-opencv
sudo apt install -y libgl1-mesa-glx libglib2.0-0

# Install Python packages
echo "📦 Installing Python packages..."
pip3 install pytesseract opencv-python pillow numpy

# Verify installations
echo "🔍 Verifying installations..."

echo "Python version:"
python3 --version

echo "Tesseract version:"
tesseract --version

echo "Available Tesseract languages:"
tesseract --list-langs

echo "Testing Python imports..."
python3 -c "
import cv2
print('✅ OpenCV version:', cv2.__version__)

import pytesseract
print('✅ pytesseract version:', pytesseract.__version__)

from PIL import Image
print('✅ PIL/Pillow imported successfully')

import numpy as np
print('✅ NumPy version:', np.__version__)

# Test Tesseract
try:
    version = pytesseract.get_tesseract_version()
    print('✅ Tesseract accessible via Python:', version)
except Exception as e:
    print('❌ Tesseract not accessible:', e)
"

# Set permissions for temp directory
echo "📁 Setting up temp directories..."
mkdir -p backend/src/routes/user/temp
chmod 755 backend/src/routes/user/temp

echo "✅ OCR setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run this script on your server: bash setup_ocr_server.sh"
echo "2. Test the OCR API again"
echo "3. Check the debug output in server logs" 