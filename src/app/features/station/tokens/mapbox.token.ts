// src/app/map/tokens/mapbox.token.ts
import { InjectionToken } from '@angular/core';

export const MAPBOX_TOKEN = new InjectionToken<string>('MAPBOX_TOKEN');
export const MAPBOX_STYLE = new InjectionToken<any>('MAPBOX_STYLE');
export const MAPBOX_DEFAULT_CENTER = new InjectionToken<[number, number]>('MAPBOX_DEFAULT_CENTER');
export const MAPBOX_DEFAULT_ZOOM = new InjectionToken<number>('MAPBOX_DEFAULT_ZOOM');
