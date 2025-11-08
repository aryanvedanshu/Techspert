# Instructor Images Download Guide

## Overview
This guide explains how to download instructor profile images from LinkedIn and add them to the project.

## Instructor Information

### 1. Mohan Naudiyal (Flutter App Development)
- **LinkedIn**: https://www.linkedin.com/in/mohan-naudiyal-151637256/
- **Image File**: `server/client/public/images/instructors/flutter.jpg`
- **Steps**:
  1. Visit the LinkedIn profile
  2. Right-click on the profile picture
  3. Select "Save image as..."
  4. Save as `flutter.jpg`
  5. Place in `server/client/public/images/instructors/`

### 2. Mayank Aggarwal (MERN Stack Development)
- **LinkedIn**: https://www.linkedin.com/in/mayank-aggarwal-59427630b/
- **Image File**: `server/client/public/images/instructors/mern.jpg`
- **Steps**:
  1. Visit the LinkedIn profile
  2. Right-click on the profile picture
  3. Select "Save image as..."
  4. Save as `mern.jpg`
  5. Place in `server/client/public/images/instructors/`

### 3. Aryan Goel (AI & Machine Learning)
- **LinkedIn**: https://www.linkedin.com/in/aryan-goel/
- **Image File**: `server/client/public/images/instructors/ai_ml.jpg`
- **Steps**:
  1. Visit the LinkedIn profile
  2. Right-click on the profile picture
  3. Select "Save image as..."
  4. Save as `ai_ml.jpg`
  5. Place in `server/client/public/images/instructors/`

### 4. Aryan Goel (Data Science)
- **LinkedIn**: https://www.linkedin.com/in/aryan-goel/
- **Image File**: `server/client/public/images/instructors/data_science.jpg`
- **Note**: Same instructor, can use the same image or a different one
- **Steps**:
  1. Visit the LinkedIn profile
  2. Right-click on the profile picture
  3. Select "Save image as..."
  4. Save as `data_science.jpg`
  5. Place in `server/client/public/images/instructors/`

## Course Thumbnail Images

Course thumbnail images should be placed in:
`server/client/public/images/courses/`

### Required Images:
- `flutter-course.jpg` - Flutter App Development course thumbnail
- `mern-course.jpg` - MERN Stack Development course thumbnail
- `ai-ml-course.jpg` - AI & Machine Learning course thumbnail
- `data-science-course.jpg` - Data Science course thumbnail

### Image Specifications:
- **Recommended Size**: 1200x630 pixels (aspect ratio 1.91:1)
- **Format**: JPG or PNG
- **File Size**: Under 500KB for optimal loading

## Alternative: Using Placeholder Images

If you don't have images ready, you can use placeholder images from services like:
- Unsplash: https://unsplash.com
- Pexels: https://www.pexels.com
- Placeholder.com: https://placeholder.com

## Verification

After adding images, verify they are accessible at:
- Instructor images: `http://localhost:5000/images/instructors/[filename]`
- Course thumbnails: `http://localhost:5000/images/courses/[filename]`

