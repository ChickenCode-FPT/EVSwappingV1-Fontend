import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Đăng ký HttpClient và interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    // (tùy chọn) các provider khác nếu bạn dùng:
    // provideZoneChangeDetection({ eventCoalescing: true }),
    // provideBrowserGlobalErrorListeners(),
  ]
};
