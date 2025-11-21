import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { StaffService } from '../services/staff.service';
import { FaceDetectionCoreService } from '../services/face-detection.service';

@Component({
  selector: 'app-face-verified',
  standalone: true,
  imports: [NgClass],
  templateUrl: './face-verified.html',
  styleUrls: ['./face-verified.css'],
})
export class FaceVerified implements OnInit, OnDestroy {

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  fIdFromApi!: Float32Array;
  resultText = 'Waiting for face...';
  match = false;

  nextUrl: string | null = null;   // URL sẽ redirect về sau khi verify
  openFlag: string | null = null;  // 'outgoing' | 'incoming' để auto mở popup bên transaction

  private detectionInterval: any;

  constructor(
    private staffService: StaffService,
    private faceCore: FaceDetectionCoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // đọc query params trước
    this.route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || null;
      this.openFlag = params['open'] || null;
    });

    // load model + camera + staff faceID
    await this.faceCore.loadModels();
    await this.startCamera();
    await this.loadStaffFid();

    this.startAutoDetection();
  }

  ngOnDestroy() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }

    if (this.video?.nativeElement?.srcObject) {
      const stream = this.video.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
  }

  // =======================
  // CAMERA
  // =======================
  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    });
    this.video.nativeElement.srcObject = stream;
  }

  // =======================
  // LOAD FACEID CỦA STAFF
  // =======================
  async loadStaffFid() {
    // Ưu tiên lấy từ localStorage (do transaction-detail set sẵn)
    const localFid = localStorage.getItem('staff_fid');
    if (localFid) {
      const binary = atob(localFid);
      const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
      this.fIdFromApi = new Float32Array(bytes.buffer);
      return;
    }

    // fallback: gọi API lấy profile
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const staff = await this.staffService.getStaffProfile(userId).toPromise();
    if (!staff?.fId) {
      this.resultText = 'No face registered yet.';
      this.match = false;
      return;
    }

    const binary = atob(staff.fId);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    this.fIdFromApi = new Float32Array(bytes.buffer);
  }

  // =======================
  // AUTO DETECTION LOOP
  // =======================
  startAutoDetection() {
    this.detectionInterval = setInterval(async () => {
      // nếu chưa có fId thì không so
      if (!this.fIdFromApi) {
        this.resultText = 'Face template not found.';
        this.match = false;
        return;
      }

      const descriptor = await this.faceCore.extractDescriptorFromVideo(
        this.video.nativeElement
      );

      if (!descriptor) {
        this.resultText = 'No face detected!';
        this.match = false;
        return;
      }

      const dist = this.faceCore.calculateDistance(descriptor, this.fIdFromApi);
      this.match = dist < 0.38;
      this.resultText = this.match
        ? 'Face matched!'
        : `No match detected! (distance: ${dist.toFixed(3)})`;

      if (this.match) {
        clearInterval(this.detectionInterval);

        // đánh dấu đã verify cho session này
        localStorage.setItem('staff_fid_verified', 'true');

        // redirect về trang trước + bắn lại param open + verified
        if (this.nextUrl) {
          this.router.navigate([this.nextUrl], {
            queryParams: {
              open: this.openFlag || null,
              verified: true
            },
          });
        } else {
          // fallback: về trang staff
          this.router.navigate(['/staff'], {
            queryParams: {
              verified: true
            }
          });
        }
      }
    }, 900);
  }
}
