export interface EcommerceMetrics {
  customers: {
    count: number;
    percentageChange: number;
  };
  orders: {
    count: number;
    percentageChange: number;
  };
}

export interface ApexChartData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

export interface HeatmapData {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}
