import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { HeatmapData } from '../../../../features/admin/statistic/models/statistic.model';

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
export class HeatmapComponent implements OnChanges {
  @ViewChild('chart') chart: any;
  @Input() heatmapData: HeatmapData | null = null;

  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [],
      chart: { type: 'heatmap', height: 350 },
      dataLabels: { enabled: false },
      xaxis: { categories: [] },
      yaxis: { labels: { style: { fontSize: '12px' } } },
      title: { text: 'Battery Swap Frequency (Heatmap)' },
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heatmapData'] && this.heatmapData) {
      this.chartOptions = {
        ...this.chartOptions,
        series: this.heatmapData.series,
        xaxis: {
          ...this.chartOptions.xaxis,
          categories: this.heatmapData.categories,
        },
      };
    }
  }
}
