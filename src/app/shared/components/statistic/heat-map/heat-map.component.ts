import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-heatmap',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './heat-map.component.html',
})
export class HeatmapComponent {
  @ViewChild('chart') chart: any;
  public chartOptions: ChartOptions;

  constructor() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i.toString());

    // Generate fake data for now
    const series: ApexAxisChartSeries = days.map((day) => ({
      name: day,
      data: hours.map(() => Math.floor(Math.random() * 100)),
    }));

    this.chartOptions = {
      series,
      chart: { type: 'heatmap', height: 350 },
      dataLabels: { enabled: false },
      xaxis: { categories: hours },
      yaxis: { labels: { style: { fontSize: '12px' } } },
      title: { text: 'Battery Swap Frequency (Heatmap)' },
    };
  }
}
