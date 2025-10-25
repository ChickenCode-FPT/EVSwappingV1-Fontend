// src\app\features\station\models\station.model.ts
export interface Station {
  /** ID của trạm (khóa chính) */ stationId: number;
  /** Tên trạm */ name: string;
  /** Địa chỉ hiển thị */ address: string;
  /** Kinh độ (Longitude) */ longitude: number;
  /** Vĩ độ (Latitude) */ latitude: number;
  /** Sức chứa tối đa của trạm */ capacity: number;
  /** Số điện thoại liên hệ */ phone: string;
  /** Trạng thái hoạt động (0 = offline, 1 = online, ...) */ status: number;
  /** Số lượng pin sẵn có */ availableBatteries: number;
  /** Khoảng cách tới user (km) — chỉ có khi gọi nearest */ distanceKm?: number;
  /** Thời gian di chuyển tới trạm (phút) — chỉ có khi gọi nearest */ durationMin?: number;
  /** Tọa độ gộp [lng, lat] (dùng cho map marker) */ coords: [number, number];
  /** Marker instance trên bản đồ (Mapbox marker object) */ marker?: any;
}
