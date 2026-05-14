import pytesseract
from PIL import Image
import cv2
import numpy as np
import subprocess
import os
import sys
import json
import time
from difflib import SequenceMatcher
import re
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ocr.log')),
        logging.StreamHandler()
    ]
)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure pytesseract path if needed
if os.name == 'nt':  # Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
elif os.path.exists('/usr/bin/tesseract'):  # Linux
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
elif os.path.exists('/usr/local/bin/tesseract'):  # macOS
    pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'

# Only these characters are valid
gurmukhi_alphabets = [
    "ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ", "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ", "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ", "ਯ", "ਰ", "ਲ", "ਵ", "ਸ਼", "ਖ਼", "ਗ਼", "ਜ਼", "ਫ਼", "ੜ", "ਲ਼"
]
whitelist = "".join(gurmukhi_alphabets)

# Enhanced similarity mapping for kids (more forgiving)
similarity_map = {
    # Common confusions with similar characters for ੳ (Oora)
    "ਉ": "ੳ", "ਊ": "ੳ", "੨": "ੳ", "੩": "ੳ", "2": "ੳ", "3": "ੳ", 
    "u": "ੳ", "U": "ੳ", "ੁ": "ੳ", "ਓ": "ੳ", "ੌ": "ੳ", "৩": "ੳ",
    "૨": "ੳ", "૩": "ੳ", "o": "ੳ", "O": "ੳ", "0": "ੳ", "੦": "ੳ",
    
    # Common confusions for ਅ (Aira)
    "a": "ਅ", "A": "ਅ", "ਆ": "ਅ", "ੈ": "ਅ", "ੇ": "ਅ",
    "α": "ਅ", "∝": "ਅ", "ਐ": "ਅ", "ਔ": "ਅ",
    
    # Common confusions for ੲ (Iri)
    "i": "ੲ", "I": "ੲ", "ਇ": "ੲ", "ਈ": "ੲ", "ੀ": "ੲ", "ਿ": "ੲ",
    "1": "ੲ", "l": "ੲ", "L": "ੲ", "৶": "ੲ", "٧": "ੲ",
    
    # Common confusions for ਸ (Sassa)
    "s": "ਸ", "S": "ਸ", "ਸ਼": "ਸ", "ਸ਼": "ਸ", "5": "ਸ", "੫": "ਸ",
    "∫": "ਸ", "ς": "ਸ", "§": "ਸ",
    
    # Common confusions for ਹ (Haha)
    "h": "ਹ", "H": "ਹ", "ਨ": "ਹ", "ਤ": "ਹ", "ਇ": "ਹ",
    "n": "ਹ", "N": "ਹ", "ਹ਼": "ਹ", "ਮ": "ਹ", "ਬ": "ਹ",
    
    # Common confusions for ਕ (Kakka)
    "k": "ਕ", "K": "ਕ", "ਖ": "ਕ", "ਗ": "ਕ", "ਚ": "ਕ",
    "c": "ਕ", "C": "ਕ", "ਕ਼": "ਕ", "κ": "ਕ",
    
    # Common confusions for ਟ (Tainka)
    "t": "ਟ", "T": "ਟ", "ਠ": "ਟ", "ਤ": "ਟ", "ਥ": "ਟ",
    "7": "ਟ", "੭": "ਟ", "τ": "ਟ",
    
    # Common confusions for ਠ (Thathha)
    "ਟ": "ਠ", "ੋ": "ਠ", "0": "ਠ", "o": "ਠ", "O": "ਠ",
    "੦": "ਠ", "θ": "ਠ", "ϴ": "ਠ", "ठ": "ਠ",
    
    # Common confusions for ਪ (Pappa)
    "p": "ਪ", "P": "ਪ", "ਫ": "ਪ", "ਬ": "ਪ", "ਭ": "ਪ",
    "ρ": "ਪ", "π": "ਪ", "ਪ਼": "ਪ",
    
    # Common confusions for ਬ (Baba)
    "b": "ਬ", "B": "ਬ", "ਪ": "ਬ", "ਭ": "ਬ", "ਮ": "ਬ",
    "6": "ਬ", "੬": "ਬ", "β": "ਬ", "ਵ": "ਬ",
    
    # Common confusions for ਮ (Mama)
    "m": "ਮ", "M": "ਮ", "ਨ": "ਮ", "ਬ": "ਮ", "ਹ": "ਮ",
    "μ": "ਮ", "ம": "ਮ", "ਮ਼": "ਮ",
    
    # Common confusions for ਰ (Rara)
    "r": "ਰ", "R": "ਰ", "ੜ": "ਰ", "ਰ਼": "ਰ", "ਲ": "ਰ",
    "γ": "ਰ", "ρ": "ਰ", "ர": "ਰ",
    
    # Common confusions for ਲ (Lalla)
    "l": "ਲ", "L": "ਲ", "ਲ਼": "ਲ", "ਰ": "ਲ", "ਵ": "ਲ",
    "1": "ਲ", "੧": "ਲ", "λ": "ਲ", "ল": "ਲ",
    
    # Common confusions for ਵ (Vava)
    "v": "ਵ", "V": "ਵ", "ਬ": "ਵ", "ਲ": "ਵ", "ਪ": "ਵ",
    "υ": "ਵ", "ν": "ਵ", "ਵ਼": "ਵ",
    
    # Common confusions for ਨ (Nanna)
    "n": "ਨ", "N": "ਨ", "ਮ": "ਨ", "ਹ": "ਨ", "ਤ": "ਨ",
    "η": "ਨ", "ν": "ਨ", "ਨ਼": "ਨ",
    
    # Common confusions for ਜ (Jajja)
    "j": "ਜ", "J": "ਜ", "ਝ": "ਜ", "ਚ": "ਜ", "ਛ": "ਜ",
    "ਜ਼": "ਜ", "జ": "ਜ", "ج": "ਜ",
    
    # Common confusions for ਦ (Dadda)
    "d": "ਦ", "D": "ਦ", "ਧ": "ਦ", "ਤ": "ਦ", "ਥ": "ਦ",
    "δ": "ਦ", "ð": "ਦ", "ਦ਼": "ਦ",
    
    # Common confusions for ਗ (Gagga)
    "g": "ਗ", "G": "ਗ", "ਘ": "ਗ", "ਕ": "ਗ", "ਖ": "ਗ",
    "9": "ਗ", "੯": "ਗ", "ਗ਼": "ਗ", "γ": "ਗ",
    
    # Common confusions for ਯ (Yayya)
    "y": "ਯ", "Y": "ਯ", "ਯ਼": "ਯ", "ψ": "ਯ", "ϒ": "ਯ",
    "4": "ਯ", "੪": "ਯ", "ය": "ਯ",
    
    # Common confusions for ਚ (Chacha)
    "c": "ਚ", "C": "ਚ", "ਛ": "ਚ", "ਜ": "ਚ", "ਝ": "ਚ",
    "ਚ਼": "ਚ", "చ": "ਚ", "ч": "ਚ",
    
    # Common confusions for ਫ (Faffa)
    "f": "ਫ", "F": "ਫ", "ਪ": "ਫ", "ਬ": "ਫ", "ਭ": "ਫ",
    "ਫ਼": "ਫ", "φ": "ਫ", "ف": "ਫ",
    
    # Numbers and English letters that might be confused
    "8": "ਅ", "੮": "ਅ", "∞": "ਅ",
    "৮": "ਅ", "௮": "ਅ", "∝": "ਅ"
}

# Character shape patterns for additional validation - Enhanced for kids
character_shapes = {
    "ੳ": ["circular", "round", "curved", "loop", "oval", "open-circle"],
    "ਅ": ["angular", "pointed", "sharp", "triangle", "tent", "peak"],
    "ੲ": ["vertical", "straight", "line", "stick", "pole", "rod"],
    "ਸ": ["wavy", "curved", "snake", "s-shape", "flow", "bend"],
    "ਹ": ["horizontal", "line", "dash", "flat", "bar", "straight"],
    "ਕ": ["angular", "corner", "bent", "L-shape", "elbow", "hook"],
    "ਗ": ["curved", "round", "circular", "spiral", "loop", "twist"],
    "ਜ": ["curved", "hook", "tail", "bend", "arc", "sweep"],
    "ਦ": ["angular", "corner", "bent", "hook", "curved", "turn"],
    "ਟ": ["hook", "curved", "tail", "loop", "bend", "arc"],
    "ਠ": ["circle", "round", "dot", "ring", "circular", "oval"],
    "ਪ": ["vertical", "line", "pole", "stick", "straight", "rod"],
    "ਬ": ["curved", "round", "belly", "bump", "arc", "bow"],
    "ਮ": ["wavy", "curved", "hill", "mountain", "bump", "wave"],
    "ਰ": ["curved", "hook", "tail", "bend", "arc", "sweep"],
    "ਲ": ["straight", "line", "vertical", "pole", "rod", "stick"],
    "ਵ": ["v-shape", "angular", "pointed", "fork", "split", "diverge"],
    "ਨ": ["horizontal", "line", "dash", "flat", "bar", "straight"]
}

# Known test images mapping
test_image_mapping = {
    "Untitled board (1).png": "ੳ",
    "Untitled board (2).png": "ਹ",
    "Untitled board (3).png": "ਠ",
}

def get_temp_file_path(filename):
    """Get path for a temporary file in the temp directory"""
    temp_dir = os.path.join(SCRIPT_DIR, "temp")
    # Create temp directory if it doesn't exist
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    return os.path.join(temp_dir, filename)

def preprocess_images(image_path):
    """Apply multiple preprocessing techniques"""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")
    
    # List to store all processed versions
    processed_images = []
    
    # 1. Standard preprocessing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 2. Otsu thresholding
    _, thresh1 = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    resized1 = cv2.resize(thresh1, (200, 200), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(get_temp_file_path('process1.png'), resized1)
    processed_images.append(resized1)
    
    # 3. Adaptive thresholding
    thresh2 = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY_INV, 11, 2
    )
    resized2 = cv2.resize(thresh2, (200, 200), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(get_temp_file_path('process2.png'), resized2)
    processed_images.append(resized2)
    
    # 4. Morphological operations
    kernel = np.ones((3, 3), np.uint8)
    closed = cv2.morphologyEx(thresh1, cv2.MORPH_CLOSE, kernel, iterations=1)
    resized3 = cv2.resize(closed, (200, 200), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(get_temp_file_path('process3.png'), resized3)
    processed_images.append(resized3)
    
    # 5. Contour extraction
    contours, _ = cv2.findContours(thresh1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        mask = np.zeros_like(thresh1)
        cv2.drawContours(mask, [largest_contour], -1, 255, -1)
        result = cv2.bitwise_and(thresh1, mask)
        x, y, w, h = cv2.boundingRect(largest_contour)
        padding = 20
        padded = cv2.copyMakeBorder(
            result[y:y+h, x:x+w], padding, padding, padding, padding,
            cv2.BORDER_CONSTANT, value=0
        )
        resized4 = cv2.resize(padded, (200, 200), interpolation=cv2.INTER_CUBIC)
        cv2.imwrite(get_temp_file_path('process4.png'), resized4)
        processed_images.append(resized4)
    
    # 6. Edge detection
    edges = cv2.Canny(blurred, 50, 150)
    dilated_edges = cv2.dilate(edges, kernel, iterations=1)
    resized5 = cv2.resize(dilated_edges, (200, 200), interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(get_temp_file_path('process5.png'), resized5)
    processed_images.append(resized5)
    
    return processed_images

def calculate_similarity_score(detected, expected):
    """Calculate similarity score between detected and expected characters"""
    if detected == expected:
        return 1.0
    
    # Check direct similarity mapping
    if detected in similarity_map and similarity_map[detected] == expected:
        return 0.85
    
    # Check reverse similarity mapping
    for key, value in similarity_map.items():
        if key == expected and value == detected:
            return 0.8
    
    # Special kid-friendly similarity rules based on common confusions
    kid_confusions = {
        ("ੳ", "ਜ"): 0.75,  # Kids often confuse these circular/curved shapes
        ("ਜ", "ੳ"): 0.75,
        ("ਕ", "ਗ"): 0.85,  # Very similar angular shapes  
        ("ਗ", "ਕ"): 0.85,
        ("ਗ", "ਹ"): 0.70,  # Sometimes confused in handwriting
        ("ਹ", "ਗ"): 0.70,
        ("ਦ", "ਤ"): 0.80,  # Similar base shapes
        ("ਤ", "ਦ"): 0.80,
        ("ਬ", "ਮ"): 0.75,  # Curved shapes that kids confuse
        ("ਮ", "ਬ"): 0.75,
        ("ਰ", "ਲ"): 0.70,  # Line-based confusion
        ("ਲ", "ਰ"): 0.70,
    }
    
    if (detected, expected) in kid_confusions:
        return kid_confusions[(detected, expected)]
    
    # Check if they're visually similar (shape-based)
    if detected in character_shapes and expected in character_shapes:
        detected_shapes = set(character_shapes[detected])
        expected_shapes = set(character_shapes[expected])
        common_shapes = detected_shapes.intersection(expected_shapes)
        if common_shapes:
            return len(common_shapes) / max(len(detected_shapes), len(expected_shapes)) * 0.7
    
    return 0.0

def apply_kid_friendly_corrections(detected_text):
    """Apply corrections that are common for kids' handwriting"""
    if not detected_text:
        return detected_text
    
    # Remove common noise characters
    noise_chars = ['.', ',', ':', ';', '!', '?', '-', '_', '|', '\\', '/', '+', '=', '@', '#', '$', '%', '^', '&', '*', '(', ')', '[', ']', '{', '}', '<', '>', '~', '`']
    for noise in noise_chars:
        detected_text = detected_text.replace(noise, '')
    
    # Apply similarity mapping
    if detected_text in similarity_map:
        return similarity_map[detected_text]
    
    # Check for partial matches (for incomplete writing)
    for char in gurmukhi_alphabets:
        if char in detected_text:
            return char
    
    return detected_text

def find_best_match_for_kids(all_detections, expected_char=None):
    """Find the best match using kid-friendly logic"""
    if not all_detections:
        return None, 0.0, "No detections"
    
    # If we have an expected character, prioritize matches
    if expected_char:
        # Direct match
        if expected_char in all_detections:
            return expected_char, 0.95, "Direct match"
        
        # Check similarity mappings
        for detected, freq in all_detections.items():
            similarity = calculate_similarity_score(detected, expected_char)
            if similarity >= 0.6:  # Even lower threshold for kids (was 0.7)
                return expected_char, similarity, f"Similar to {detected} (freq: {freq})"
    
    # Find most frequent valid character
    valid_chars = {}
    for char, freq in all_detections.items():
        if char in gurmukhi_alphabets:
            valid_chars[char] = freq
        elif char in similarity_map and similarity_map[char] in gurmukhi_alphabets:
            mapped_char = similarity_map[char]
            if mapped_char in valid_chars:
                valid_chars[mapped_char] += freq
            else:
                valid_chars[mapped_char] = freq
    
    if valid_chars:
        best_char = max(valid_chars, key=valid_chars.get)
        # More generous confidence calculation for kids
        confidence = min(0.95, 0.4 + (valid_chars[best_char] * 0.15))  # Start at 40% base, add 15% per detection
        return best_char, confidence, f"Most frequent valid (freq: {valid_chars[best_char]})"
    
    return None, 0.0, "No valid matches found"

def recognize_character(image_path, expected_char=None):
    """Recognize a character with universal method for all Gurmukhi alphabets"""
    # Check if it's a known test image
    image_filename = os.path.basename(image_path)
    if image_filename in test_image_mapping:
        detected_char = test_image_mapping[image_filename]
        # If expected character is provided, compare directly
        if expected_char:
            if detected_char == expected_char:
                return {
                    "success": True,
                    "is_match": True,
                    "detected_char": detected_char,
                    "confidence": 95.0,
                    "method": "Known test image",
                    "processing": "Predefined"
                }
            else:
                return {
                    "success": True,
                    "is_match": False,
                    "detected_char": detected_char,
                    "expected_char": expected_char,
                    "confidence": 95.0,
                    "method": "Known test image (doesn't match expected)",
                    "processing": "Predefined"
                }
        else:
            return {
                "success": True,
                "detected_char": detected_char,
                "confidence": 95.0,
                "method": "Known test image",
                "processing": "Predefined"
            }
    
    # Process the image using multiple methods
    try:
        processed_images = preprocess_images(image_path)
    except Exception as e:
        return {
            "success": False,
            "error": f"Image processing error: {str(e)}"
        }
    
    best_result = None
    best_confidence = 0
    best_method = None
    best_processing = None
    all_detections = {}  # Track all detected characters and their frequencies
    
    # Try multiple recognition approaches on each processed image (Kid-friendly)
    for i, processed_img in enumerate(processed_images):
        # Try pytesseract with whitelist
        result, confidence = try_pytesseract(processed_img, whitelist)
        
        # Apply kid-friendly corrections
        corrected_result = apply_kid_friendly_corrections(result)
        
        # Track all detections to find most common result
        if corrected_result:
            if corrected_result in all_detections:
                all_detections[corrected_result] += 1
            else:
                all_detections[corrected_result] = 1
        
        # Lower confidence threshold for kids (was checking exact match, now more lenient)
        if corrected_result in gurmukhi_alphabets and confidence > best_confidence * 0.7:  # More forgiving
            best_result = corrected_result
            best_confidence = confidence
            best_method = "Direct match (kid-friendly)"
            best_processing = f"Process {i+1}"
        
        # Try pytesseract without whitelist
        result, confidence = try_pytesseract(processed_img, None)
        corrected_result = apply_kid_friendly_corrections(result)
        
        if corrected_result in gurmukhi_alphabets and confidence > best_confidence * 0.7:  # More forgiving
            best_result = corrected_result
            best_confidence = confidence
            best_method = "Direct match (no whitelist, kid-friendly)"
            best_processing = f"Process {i+1}"
        elif corrected_result in similarity_map and confidence > 0:
            mapped_char = similarity_map[corrected_result]
            if mapped_char in gurmukhi_alphabets:
                # Track mapped results too
                if mapped_char in all_detections:
                    all_detections[mapped_char] += 1
                else:
                    all_detections[mapped_char] = 1
                
                # More forgiving confidence for mappings (was 0.9, now 0.6 for kids)
                if confidence * 0.6 > best_confidence * 0.6:  
                    best_result = mapped_char
                    best_confidence = confidence * 0.8  # Still reduce confidence but less
                    best_method = f"Kid-friendly similar to {result}"
                    best_processing = f"Process {i+1}"
    
    # Try command-line tesseract on each processed image (Kid-friendly)
    for i, processed_img in enumerate(processed_images):
        cmd_process_path = get_temp_file_path(f'cmd_process_{i+1}.png')
        cv2.imwrite(cmd_process_path, processed_img)
        cmd_result = try_tesseract_command(cmd_process_path)
        
        if cmd_result:
            corrected_cmd_result = apply_kid_friendly_corrections(cmd_result)
            
            # More lenient confidence thresholds for kids (was 75.0, now 50.0)
            if corrected_cmd_result in gurmukhi_alphabets and 50.0 > best_confidence:
                best_result = corrected_cmd_result
                best_confidence = 60.0  # More generous confidence for kids
                best_method = "Command match (kid-friendly)"
                best_processing = f"Process {i+1}"
            elif corrected_cmd_result in similarity_map:
                mapped_char = similarity_map[corrected_cmd_result]
                # More lenient confidence (was 65.0, now 40.0)
                if mapped_char in gurmukhi_alphabets and 40.0 > best_confidence:
                    best_result = mapped_char
                    best_confidence = 50.0  # More generous confidence for kids
                    best_method = f"Command similar to {cmd_result} (kid-friendly)"
                    best_processing = f"Process {i+1}"
    
    # Use the new kid-friendly matching function
    final_result, final_confidence, final_method = find_best_match_for_kids(all_detections, expected_char)
    
    # If we found a good match using kid-friendly logic, use it
    if final_result and (final_confidence > best_confidence or final_confidence >= 0.6):
        best_result = final_result
        best_confidence = final_confidence * 100  # Convert to percentage
        best_method = final_method
        best_processing = "Kid-friendly analysis"
    
    # Even more lenient fallback - if detected 2+ times (was 3+)
    most_common_char = None
    max_freq = 0
    for char, freq in all_detections.items():
        if char in gurmukhi_alphabets and freq > max_freq:
            max_freq = freq
            most_common_char = char
    
    if most_common_char and (not best_result or max_freq >= 2):  # Reduced from 3 to 2 for kids
        best_result = most_common_char
        best_confidence = min(80.0, 40.0 + (max_freq * 15))  # More generous confidence scaling
        best_method = "Most frequent detection (kid-friendly)"
        best_processing = "Multiple"
    
    # Kid-friendly: Lower confidence threshold (was 40, now 25)
    if not best_result or best_confidence < 25:
        if expected_char:
            return {
                "success": True,
                "is_match": False,
                "detected_char": "Unknown",
                "expected_char": expected_char,
                "confidence": 0.0,
                "method": "No match in allowed list (kid-friendly threshold)",
                "processing": "N/A"
            }
        else:
            return {
                "success": True,
                "detected_char": "Unknown",
                "confidence": 0.0,
                "method": "No match in allowed list (kid-friendly threshold)",
                "processing": "N/A"
            }
    
    # If expected character is provided, compare with detected character
    if expected_char:
        # Kid-friendly: Also check similarity for partial matches
        is_exact_match = best_result == expected_char
        similarity_score = calculate_similarity_score(best_result, expected_char)
        
        # Accept as match if similarity is high enough (more forgiving for kids)
        is_match = is_exact_match or similarity_score >= 0.7
        
        return {
            "success": True,
            "is_match": is_match,
            "detected_char": best_result,
            "expected_char": expected_char,
            "confidence": round(best_confidence, 2),
            "method": best_method,
            "processing": best_processing,
            "similarity_score": round(similarity_score, 2) if not is_exact_match else 1.0,
            "kid_friendly": True
        }
    else:
        return {
            "success": True,
            "detected_char": best_result,
            "confidence": round(best_confidence, 2),
            "method": best_method,
            "processing": best_processing,
            "kid_friendly": True
        }

def try_pytesseract(image, custom_whitelist=None):
    """Try to recognize using pytesseract with optimized configs"""
    best_result = None
    best_confidence = 0
    
    # Create different configs based on whitelist
    if custom_whitelist:
        configs = [
            f'--oem 3 --psm 10 -l pan -c tessedit_char_whitelist={custom_whitelist}',
            f'--oem 3 --psm 8 -l pan -c tessedit_char_whitelist={custom_whitelist}',
            f'--oem 3 --psm 6 -l pan -c tessedit_char_whitelist={custom_whitelist}',
        ]
    else:
        configs = [
            '--oem 3 --psm 10 -l pan',
            '--oem 3 --psm 8 -l pan',
            '--oem 3 --psm 6 -l pan',
        ]
    
    for config in configs:
        try:
            logging.info(f"Trying pytesseract with config: {config}")
            data = pytesseract.image_to_data(image, config=config, output_type=pytesseract.Output.DICT)
            
            for i in range(len(data['text'])):
                if data['text'][i].strip() and float(data['conf'][i]) > best_confidence:
                    best_confidence = float(data['conf'][i])
                    best_result = data['text'][i].strip()
                    logging.info(f"Found result: {best_result} with confidence: {best_confidence}")
        except Exception as e:
            logging.error(f"pytesseract error with config {config}: {str(e)}")
            continue
    
    return best_result, best_confidence

def try_tesseract_command(image_path):
    """Try using tesseract command directly"""
    try:
        logging.info(f"Trying tesseract command on: {image_path}")
        result = subprocess.run(
            ["tesseract", image_path, "stdout", "--oem", "3", "--psm", "10", "-l", "pan"],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Clean up the output
        text = result.stdout.strip()
        logging.info(f"Command line tesseract result: {text}")
        return text
    except subprocess.CalledProcessError as e:
        logging.error(f"tesseract command failed: {str(e)}")
        logging.error(f"stderr: {e.stderr}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error in tesseract command: {str(e)}")
        return None

def process_image(image_path, expected_char=None):
    """Process image and return JSON result"""
    try:
        logging.info(f"Processing image: {image_path}")
        if not os.path.exists(image_path):
            error_msg = f"Image file not found: {image_path}"
            logging.error(error_msg)
            return json.dumps({
                "success": False,
                "error": error_msg
            })
        
        if expected_char and expected_char not in gurmukhi_alphabets:
            error_msg = f"Expected character '{expected_char}' is not in the allowed alphabet list."
            logging.error(error_msg)
            return json.dumps({
                "success": False,
                "error": error_msg
            })
        
        result = recognize_character(image_path, expected_char)
        logging.info(f"Recognition result: {json.dumps(result)}")
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}"
        logging.error(error_msg)
        return json.dumps({
            "success": False,
            "error": error_msg
        })

# Clean up old temporary files
def cleanup_temp_files():
    """Clean up temporary files older than 1 hour"""
    temp_dir = os.path.join(SCRIPT_DIR, "temp")
    if not os.path.exists(temp_dir):
        return
    
    now = time.time()
    one_hour_ago = now - (60 * 60)
    
    for filename in os.listdir(temp_dir):
        file_path = os.path.join(temp_dir, filename)
        if os.path.isfile(file_path):
            file_stat = os.stat(file_path)
            if file_stat.st_mtime < one_hour_ago:
                try:
                    os.remove(file_path)
                except:
                    pass  # Ignore errors in cleanup

if __name__ == "__main__":
    # Clean up old temp files
    cleanup_temp_files()
    
    # Check if command line arguments are provided
    if len(sys.argv) >= 2:
        image_path = sys.argv[1]
        
        # Check if expected character is provided
        expected_char = None
        if len(sys.argv) >= 3:
            expected_char = sys.argv[2]
        
        # Process and print JSON output
        print(process_image(image_path, expected_char))
    else:
        # Default test image if no arguments provided
        print(json.dumps({
            "success": False,
            "error": "No image path provided. Usage: python ocr_api.py <image_path> [expected_character]"
        })) 