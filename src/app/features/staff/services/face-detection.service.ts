import { Injectable, NgZone } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';

@Injectable({ providedIn: 'root' })
export class FaceDetectionCoreService {
  
  modelsLoaded = false;

  async loadModels() {
    if (this.modelsLoaded) return;

    const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    this.modelsLoaded = true;
  }

  async extractDescriptorFromVideo(video: HTMLVideoElement): Promise<Float32Array | null> {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.5,
    });

    const detection = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    return detection ? detection.descriptor : null;
  }

  calculateDistance(a: Float32Array, b: Float32Array): number {
    return faceapi.euclideanDistance(a, b);
  }
}
