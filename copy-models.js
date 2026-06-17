import fs from 'fs';
import path from 'path';

const srcDir = './node_modules/@vladmandic/face-api/model/';
const destDir = './public/models/';

const filesToCopy = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.bin'
];

console.log('Starting face-api.js models copy...');

if (!fs.existsSync(destDir)){
  fs.mkdirSync(destDir, { recursive: true });
}

filesToCopy.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: Source file not found: ${srcFile}`);
  }
});

console.log('Model copy finished successfully!');
