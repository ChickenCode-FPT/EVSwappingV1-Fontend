import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexFill,
  ApexMarkers,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
  ApexYAxis,
  ApexLegend,
} from 'ng-apexcharts';
import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';
import { ApexChartData } from '../../../../features/admin/statistic/models/statistic.model';

@Component({
  selector: 'app-statics-chart',
  imports: [CommonModule, NgApexchartsModule, ChartTabComponent],
  templateUrl: './statics-chart.component.html',
})
export class StatisticsChartComponent implements OnChanges {
  @Input() chartData: ApexChartData | null = null;

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 310,
    type: 'line',
    toolbar: { show: false },
    width: '100%',
  };
  public colors: string[] = ['#191970', '#228B22'];
  public stroke: ApexStroke = {
    curve: 'straight',
    width: [2, 3],
  };
  public fill: ApexFill = {
    type: ['solid', 'transparent'],
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  };
  public markers: ApexMarkers = {
    size: 0,
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 },
  };
  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };
  public dataLabels: ApexDataLabels = { enabled: false };
  public tooltip: ApexTooltip = {
    enabled: true,
    x: { format: 'dd MMM yyyy' },
    y: {
      formatter: (val, { seriesIndex, w }) => {
        if (w.config.series[seriesIndex].name === 'Revenue (k VND)') {
          return val.toLocaleString() + ' VND';
        }
        return val.toString();
      },
    },
  };
  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  };
  public yaxis: ApexYAxis | ApexYAxis[] = [
    {
      seriesName: 'Battery Swaps',
      title: {
        text: 'Battery Swaps',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#191970',
        },
      },
      labels: {
        style: {
          colors: ['#6B7280'],
        },
      },
    },
    {
      seriesName: 'Revenue (k VND)',
      opposite: true,
      title: {
        text: 'Revenue (k VND)',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#228B22',
        },
      },
      labels: {
        style: {
          colors: ['#6B7280'],
        },
        formatter: function (val) {
          if (!val) return '';
          return (val / 1000).toFixed(0) + 'k';
        },
      },
    },
  ];
  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartData'] && this.chartData) {
      this.series = this.chartData.series;
      this.xaxis = {
        ...this.xaxis,
        categories: this.chartData.categories,
      };
    }
  }
}
