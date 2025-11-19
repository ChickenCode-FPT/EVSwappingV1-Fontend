import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HeatmapComponent } from '../../../shared/components/statistic/heat-map/heat-map.component';
import { EcommerceMetricsComponent } from '../../../shared/components/statistic/ecommerce-metrics/ecommerce-metrics.component';
import { StatisticsChartComponent } from '../../../shared/components/statistic/statics-chart/statics-chart.component';
import { StatisticService } from './services/statistic.service';
import { firstValueFrom } from 'rxjs';
import { ApexChartData, EcommerceMetrics, HeatmapData } from './models/statistic.model';

// Define default empty data objects
const defaultEcommerceMetrics: EcommerceMetrics = {
  customers: { count: 0, percentageChange: 0 },
  orders: { count: 0, percentageChange: 0 },
};

const defaultApexChartData: ApexChartData = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  series: [
    {
      name: 'Battery Swaps',
      data: [120, 150, 170, 130, 180, 220, 200],
    },
    {
      name: 'Revenue (k VND)',
      data: [600, 700, 820, 680, 900, 1100, 950],
    },
  ],
};

const defaultHeatmapData: HeatmapData = {
  series: [
    {
      name: 'Mon',
      data: [
        74, 34, 77, 47, 27, 84, 81, 38, 46, 33, 73, 22, 5, 9, 28, 96, 27, 48, 61, 33, 4, 20, 4, 98,
      ],
    },
    {
      name: 'Tue',
      data: [
        87, 63, 94, 41, 66, 96, 70, 57, 37, 3, 19, 36, 6, 52, 82, 31, 15, 31, 15, 67, 43, 43, 44,
        53,
      ],
    },
    {
      name: 'Wed',
      data: [
        26, 88, 21, 57, 19, 24, 26, 15, 84, 1, 70, 64, 90, 50, 48, 93, 76, 79, 28, 94, 79, 32, 10,
        1,
      ],
    },
    {
      name: 'Thu',
      data: [
        77, 67, 79, 46, 83, 3, 42, 10, 0, 82, 60, 84, 14, 81, 85, 67, 70, 94, 24, 79, 29, 31, 19,
        11,
      ],
    },
    {
      name: 'Fri',
      data: [
        44, 16, 35, 84, 59, 86, 92, 23, 49, 4, 53, 40, 12, 41, 1, 12, 50, 70, 77, 49, 27, 25, 90,
        23,
      ],
    },
    {
      name: 'Sat',
      data: [
        88, 9, 42, 72, 42, 39, 70, 14, 3, 50, 23, 8, 20, 19, 58, 78, 45, 23, 28, 3, 2, 8, 21, 62,
      ],
    },
    {
      name: 'Sun',
      data: [
        90, 60, 56, 3, 48, 10, 88, 41, 4, 24, 93, 86, 98, 54, 5, 77, 9, 24, 16, 56, 18, 79, 92, 67,
      ],
    },
  ],
  categories: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ],
};

@Component({
  selector: 'app-statistic-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SidebarComponent,
    HeatmapComponent,
    EcommerceMetricsComponent,
    StatisticsChartComponent,
  ],
  templateUrl: './statistic-dashboard.html',
  styleUrls: ['./statistic-dashboard.css'],
})
export class StatisticDashboardComponent implements OnInit {
  private statisticService = inject(StatisticService);

  // State Signals
  public currentYear = new Date().getFullYear();
  public startDate = signal(new Date(this.currentYear, 0, 1));
  public endDate = signal(new Date());
  public period = signal<'day' | 'month' | 'year'>('month');

  public ecommerceMetrics = signal<EcommerceMetrics>(defaultEcommerceMetrics);
  public chartData = signal<ApexChartData>(defaultApexChartData);
  public heatmapData = signal<HeatmapData>(defaultHeatmapData);
  public loadingChart = signal(false);
  public loadingMetrics = signal(false);
  public loadingHeatmap = signal(false);

  async ngOnInit() {
    await Promise.all([this.loadEcommerceMetrics(), this.loadHeatmapData(), this.loadChartData()]);
  }

  async loadEcommerceMetrics() {
    this.loadingMetrics.set(true);
    try {
      const data = await firstValueFrom(this.statisticService.getEcommerceMetrics());
      this.ecommerceMetrics.set(data || defaultEcommerceMetrics);
    } catch (error) {
      console.error('Error loading ecommerce metrics:', error);
      this.ecommerceMetrics.set(defaultEcommerceMetrics);
    } finally {
      this.loadingMetrics.set(false);
    }
  }

  async loadChartData() {
    this.loadingChart.set(true);
    const params = {
      startDate: this.startDate(),
      endDate: this.endDate(),
      period: this.period(),
    };
    try {
      const revenue = await firstValueFrom(
        this.statisticService.getChartData(params.startDate, params.endDate, params.period)
      );

      if (!revenue || !revenue.dataPoints) {
        this.chartData.set(defaultApexChartData);
        return;
      }

      const newChartData: ApexChartData = {
        categories: revenue.dataPoints.map((p: any) => p.lable),
        series: [
          // defaultApexChartData.series[0],
          {
            name: 'Revenue (k VND)',
            data: revenue.dataPoints.map((p: any) => p.value),
          },
        ],
      };
      this.chartData.set(newChartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
      this.chartData.set(defaultApexChartData);
    } finally {
      this.loadingChart.set(false);
    }
  }

  async loadHeatmapData() {
    this.loadingHeatmap.set(true);
    try {
      const data = await firstValueFrom(this.statisticService.getHeatmapData());
      this.heatmapData.set(data || defaultHeatmapData);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      this.heatmapData.set(defaultHeatmapData);
    } finally {
      this.loadingHeatmap.set(false);
    }
  }

  async updateDateRange(newStartDate: Date, newEndDate: Date, newPeriod: 'day' | 'month' | 'year') {
    this.startDate.set(newStartDate);
    this.endDate.set(newEndDate);
    this.period.set(newPeriod);
    await this.loadChartData();
  }
}
