#!/usr/bin/env python3
"""
Test script to verify OCR server setup and dependencies
"""

import sys
import os
import subprocess
import json

def check_tesseract():
    """Check if Tesseract is installed and accessible"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, 
                              text=True)
        print(f"✅ Tesseract version: {result.stdout.strip()}")
        
        # Check for Punjabi language pack
        result = subprocess.run(['tesseract', '--list-langs'], 
                              capture_output=True, 
                              text=True)
        if 'pan' in result.stdout:
            print("✅ Punjabi language pack is installed")
        else:
            print("❌ Punjabi language pack is missing!")
            return False
        return True
    except Exception as e:
        print(f"❌ Tesseract check failed: {str(e)}")
        return False

def check_python_packages():
    """Check if required Python packages are installed"""
    required_packages = ['pytesseract', 'opencv-python', 'Pillow', 'numpy']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing_packages.append(package)
    
    return len(missing_packages) == 0

def check_temp_directory():
    """Check if temp directory exists and is writable"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    temp_dir = os.path.join(script_dir, "temp")
    
    try:
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
            print(f"✅ Created temp directory at {temp_dir}")
        else:
            print(f"✅ Temp directory exists at {temp_dir}")
        
        # Test write permissions
        test_file = os.path.join(temp_dir, "test.txt")
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("✅ Temp directory is writable")
        return True
    except Exception as e:
        print(f"❌ Temp directory check failed: {str(e)}")
        return False

def main():
    print("🔍 Starting OCR server environment check...")
    print("=" * 50)
    
    # Check Tesseract
    if not check_tesseract():
        print("\n❌ Tesseract setup failed!")
        return 1
    
    # Check Python packages
    if not check_python_packages():
        print("\n❌ Some required Python packages are missing!")
        return 1
    
    # Check temp directory
    if not check_temp_directory():
        print("\n❌ Temp directory setup failed!")
        return 1
    
    print("\n✅ All checks passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 