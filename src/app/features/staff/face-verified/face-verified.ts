import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from '../services/staff.service';
import { FaceDetectionCoreService } from '../services/face-detection.service';
import { NgClass } from '@angular/common';
import { SwapTransactionService } from '../services/swapTransaction-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-face-verified',
  imports: [NgClass],
  templateUrl: './face-verified.html',
  styleUrls: ['./face-verified.css']
})
export class FaceVerified implements OnInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  fIdFromApi!: Float32Array;
  resultText = '';
  match = false;
  transactionId!: string;

  showSuccessPopup = false;

  private detectionInterval: any;

  constructor(
    private staffService: StaffService,
    private swapService: SwapTransactionService,
    private faceCore: FaceDetectionCoreService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    await this.faceCore.loadModels();
    await this.startCamera();
    await this.getFid();

    this.route.queryParams.subscribe(params => {
      this.transactionId = params['swapTransactionId'];
    });

    this.startAutoDetection();
  }

  ngOnDestroy() {
    if (this.detectionInterval) clearInterval(this.detectionInterval);
    const stream = this.video.nativeElement.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach(track => track.stop());
  }

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    this.video.nativeElement.srcObject = stream;
  }

  async getFid() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const staff = await this.staffService.getStaffProfile(userId).toPromise();
    if (!staff || !staff.fId) return;

    const binary = atob(staff.fId);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    this.fIdFromApi = new Float32Array(bytes.buffer);
  }

  startAutoDetection() {
    this.detectionInterval = setInterval(async () => {
      const descriptor = await this.faceCore.extractDescriptorFromVideo(
        this.video.nativeElement
      );
      if (!descriptor) {
        this.resultText = 'No face detected!';
        this.match = false;
        return;
      }

      const distance = this.faceCore.calculateDistance(descriptor, this.fIdFromApi);
      this.match = distance < 0.38;
      this.resultText = this.match ? 'Face matched!' : 'No match detected!';

      if (this.match && this.transactionId) {
        clearInterval(this.detectionInterval);
        this.showSuccessPopup = true;

        await this.updateSwapStatus();
      }
    }, 1000);
  }

  async updateSwapStatus() {
    const id = Number(this.transactionId);
    const staffId = localStorage.getItem("userId");

    const trx: any = await this.swapService.getFullTransactionById(id).toPromise();

    if (!trx) {
      console.error("Không tìm thấy transaction!");
      return;
    }

    const body = {
      swapTransactionId: id,
      customerId: trx.customerUserId,
      staffId: staffId,
      fee: trx.price ?? 0,
      swapStatus: "Completed"
    };

    console.log("📤 Sending update:", body);

    await this.swapService.updateTransaction(id, body).toPromise();
  }


  closeSuccessPopup() {
    this.showSuccessPopup = false;

    this.router.navigate(
      ['/staff/battery/transaction', this.transactionId],
      { queryParams: { showPopup: false } }
    );
  }
}
