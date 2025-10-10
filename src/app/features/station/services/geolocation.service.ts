import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  /**
   * Lấy vị trí hiện tại với retry + fallback
   * @param useHighAccuracy có bật highAccuracy hay không
   * @param retries số lần thử lại
   * @param delayMs thời gian delay giữa các lần thử
   * @param statusCb callback báo trạng thái (hiển thị UI/log)
   */
  getCurrentLocation(
    useHighAccuracy: boolean = true,
    retries: number = 3,
    delayMs: number = 2000,
    statusCb?: (msg: string) => void
  ): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = { code: -1, message: 'Geolocation không hỗ trợ' };
        statusCb?.('⚠️ Trình duyệt không hỗ trợ geolocation');
        return reject(err);
      }

      const mode = useHighAccuracy ? '[HighAcc]' : '[LowAcc]';

      const tryGet = (attempt: number) => {
        statusCb?.(`${mode} 📡 Thử lấy vị trí… attempt ${attempt}/${retries}`);
        // console.log(`${mode} 📡 Thử lấy vị trí… attempt ${attempt}/${retries}`);

        navigator.geolocation.getCurrentPosition(
          pos => {
            const coords: [number, number] = [
              pos.coords.longitude,
              pos.coords.latitude,
            ];
            // console.log(`${mode} ✅ Thành công:`, coords);
            statusCb?.(`${mode} ✅ Lấy vị trí thành công`);
            resolve(coords);
          },
          err => {
            // console.warn(`${mode} ❌ Lỗi attempt ${attempt}:`, err);
            if (attempt < retries) {
              setTimeout(() => tryGet(attempt + 1), delayMs);
            } else {
              if (useHighAccuracy) {
                statusCb?.(
                  '⚠️ HighAccuracy fail sau nhiều lần → thử lại với LowAcc'
                );
                // console.warn(
                //   '⚠️ HighAccuracy fail sau nhiều lần → fallback sang LowAcc'
                // );
                this.getCurrentLocation(false, retries, delayMs, statusCb)
                  .then(resolve)
                  .catch(reject);
              } else {
                statusCb?.('❌ Không thể lấy vị trí ngay cả khi LowAcc');
                reject(err);
              }
            }
          },
          {
            enableHighAccuracy: useHighAccuracy,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      };

      tryGet(1);
    });
  }

  /**
   * Theo dõi vị trí liên tục
   */
  watchLocation(
    callback: (coords: [number, number]) => void,
    useHighAccuracy: boolean = true
  ) {
    if (!navigator.geolocation) {
      // console.warn('⚠️ Geolocation không hỗ trợ trên browser này');
      return;
    }

    return navigator.geolocation.watchPosition(
      pos => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        // console.log('📍 Vị trí thay đổi:', coords);
        callback(coords);
      },
      err => {
        // console.error('❌ Lỗi khi theo dõi vị trí:', err);
      },
      { enableHighAccuracy: useHighAccuracy, timeout: 10000, maximumAge: 0 }
    );
  }
}
