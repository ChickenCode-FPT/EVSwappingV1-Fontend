import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';

import { StaffService } from '../services/staff.service';
import { FaceDetectionCoreService } from '../services/face-detection.service';
import { StaffDto, StaffUpdateDto } from '../../models/staff.model';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

type EnrollmentStep = 'front' | 'left' | 'right' | 'completed';

@Component({
  selector: 'app-face-add',
  templateUrl: './face-add.html',
  styleUrl: './face-add.css',
  standalone: true
})
export class FaceAdd implements OnInit, OnDestroy {

  @ViewChild('videoEl', { static: false }) videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay', { static: false }) overlay!: ElementRef<HTMLCanvasElement>;

  currentStep: EnrollmentStep = 'front';
  capturedDescriptors: Float32Array[] = [];

  isCameraOn = false;
  faceDetected = false;
  faceQuality = 'none';
  status = 'Loading models...';
  success = '';

  countdown = 0;
  countdownInterval: any;

  readonly PROCESS_INTERVAL = 300;
  readonly MATCH_THRESHOLD = 0.38;

  frameBox = { x: 170, y: 90, size: 300 };

  private lastProcess = 0;
  private animationId: number = 0;

  constructor(
    private staffService: StaffService,
    private faceCore: FaceDetectionCoreService,
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone
  ) { }

  async ngOnInit() {
    await tf.setBackend('webgl').catch(async () => await tf.setBackend('cpu'));
    await tf.ready();
    await this.faceCore.loadModels();

    this.status = 'Click START to begin enrollment.';
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  // CAMERA
  async startCamera() {
    const video = this.videoEl.nativeElement;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });

    video.srcObject = stream;
    this.isCameraOn = true;

    video.onloadedmetadata = () => {
      video.play();
      this.loopDetection();
    };
  }

  stopCamera() {
    const video = this.videoEl?.nativeElement;
    if (!video?.srcObject) return;

    const tracks = (video.srcObject as MediaStream).getTracks();
    tracks.forEach(t => t.stop());
  }

  // LOOP DETECTION
  private loopDetection() {
    this.animationId = requestAnimationFrame(() => this.loopDetection());

    const now = performance.now();
    if (now - this.lastProcess < this.PROCESS_INTERVAL) return;
    this.lastProcess = now;

    this.processFrame();
    this.drawOverlay();
  }

  // FRAME PROCESSING
  private async processFrame() {
    const video = this.videoEl.nativeElement;

    let detection: any = null;

    try {
      detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    } catch (err) {
      detection = null;
    }


    if (!detection) {
      this.faceDetected = false;
      this.faceQuality = 'none';
      return;
    }

    this.faceDetected = true;
    this.analyzeFaceQuality(detection);

    if (this.faceQuality !== 'good') return;

    const poseOk = this.validateHeadPose(detection.landmarks, this.currentStep);
    if (!poseOk) {
      this.status = `Look ${this.currentStep.toUpperCase()} correctly...`;
      this.stopCountdown();
      return;
    }

    if (this.countdown === 0) this.startCountdown(detection);
  }

  // COUNTDOWN + CAPTURE
  private startCountdown(detection: any) {
    this.countdown = 3;

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.capture(detection);
      }
    }, 1000);
  }

  private stopCountdown() {
    clearInterval(this.countdownInterval);
    this.countdown = 0;
  }

  // CAPTURE
  private capture(detection: any) {
    this.capturedDescriptors.push(detection.descriptor);

    if (this.currentStep === 'front') {
      this.currentStep = 'left';
      this.status = 'Turn head LEFT.';
    } else if (this.currentStep === 'left') {
      this.currentStep = 'right';
      this.status = 'Turn head RIGHT.';
    } else if (this.currentStep === 'right') {
      this.finishEnrollment();
    }
  }

  // FINISH
  private finishEnrollment() {
    this.currentStep = 'completed';
    this.status = 'Saving face profile...';

    const descriptor = this.calculateAverageDescriptor(this.capturedDescriptors);
    const fId = btoa(String.fromCharCode(...new Uint8Array(descriptor.buffer)));

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.staffService.getStaffProfile(userId).subscribe({
      next: (staff: StaffDto) => {
        const payload: StaffUpdateDto = {
          userId: staff.id,
          email: staff.email,
          fullName: staff.fullName,
          phoneNumber: staff.phoneNumber,
          fId: fId
        };

        this.staffService.updateFaceId(payload).subscribe({
          next: () => {
            this.success = 'Face ID registered successfully!';
            this.status = '';
            this.stopCamera();

            const returnTo = this.route.snapshot.queryParams['returnTo'];
            if (returnTo) {
              this.router.navigateByUrl(returnTo);
            }

          },
          error: () => {
            this.success = 'Failed to save Face ID.';
          }
        });
      }
    });
  }

  // POSE CHECK
  private validateHeadPose(landmarks: faceapi.FaceLandmarks68, step: EnrollmentStep): boolean {
    const p = landmarks.positions;
    const nose = p[30];
    const leftEye = p[36];
    const rightEye = p[45];
    const cheekL = p[0];
    const cheekR = p[16];

    const eyeDist = Math.abs(rightEye.x - leftEye.x);

    const leftRatio = Math.abs(nose.x - cheekL.x) / eyeDist;
    const rightRatio = Math.abs(nose.x - cheekR.x) / eyeDist;

    if (step === 'front') {
      return Math.abs(leftRatio - rightRatio) < 0.3;
    }
    if (step === 'left') {
      const result = leftRatio > 1;
      console.log(`Left pose ok: ${result}`);
      return result;
    }
    if (step === 'right') {
      const result = rightRatio > 1;
      console.log(`Right pose ok: ${result}`);
      return result;
    }
    return false;
  }

  // FACE QUALITY
  private analyzeFaceQuality(detection: any) {
    const box = detection.detection.box;
    const area = box.width * box.height;

    if (area < 5000) {
      this.faceQuality = 'too_far';
      console.log('Face is too far from the camera.');
    } else if (area > 30000) {
      this.faceQuality = 'too_close';
      console.log('Face is too close to the camera.');
    } else {
      this.faceQuality = 'good';
      console.log('Face is at a good distance.');
    }
  }

  // AVERAGE DESCRIPTOR
  private calculateAverageDescriptor(list: Float32Array[]) {
    const avg = new Float32Array(list[0].length);
    for (const d of list) {
      for (let i = 0; i < d.length; i++) avg[i] += d[i];
    }
    for (let i = 0; i < avg.length; i++) avg[i] /= list.length;
    return avg;
  }

  // OVERLAY UI
  private drawOverlay() {
    if (!this.overlay?.nativeElement || !this.videoEl?.nativeElement) return;

    const canvas = this.overlay.nativeElement;
    const video = this.videoEl.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color =
      !this.faceDetected ? '#ff4444' :
        this.faceQuality === 'good' ? '#00ff00' : '#ffaa00';

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(
      canvas.width / 2 - 150,
      canvas.height / 2 - 150,
      300,
      300
    );

    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Step: ${this.currentStep}`, 20, 40);

    if (this.countdown > 0) {
      ctx.font = '48px Arial';
      ctx.fillText(String(this.countdown), canvas.width / 2 - 10, canvas.height / 2);
    }
  }
}
