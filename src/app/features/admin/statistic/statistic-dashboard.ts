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
  customers: { count: 100, percentageChange: 10 },
  orders: { count: 20, percentageChange: -5 },
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
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Tue',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Wed',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Thu',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Fri',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Sat',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      name: 'Sun',
      data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonthComparable = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      const [
        currentMonthRevenueRes,
        previousMonthRevenueRes,
        currentMonthSwapsRes,
        previousMonthSwapsRes,
      ] = await Promise.all([
        firstValueFrom(this.statisticService.getTotalRevenue(startOfCurrentMonth, now)),
        firstValueFrom(
          this.statisticService.getTotalRevenue(startOfPreviousMonth, endOfPreviousMonthComparable)
        ),
        firstValueFrom(this.statisticService.getTotalSwaps(startOfCurrentMonth, now)),
        firstValueFrom(
          this.statisticService.getTotalSwaps(startOfPreviousMonth, endOfPreviousMonthComparable)
        ),
      ]);

      const currentMonthRevenue = currentMonthRevenueRes.totalRevenue || 0;
      const previousMonthRevenue = previousMonthRevenueRes.totalRevenue || 0;
      const currentMonthSwaps = currentMonthSwapsRes.totalSwaps || 0;
      const previousMonthSwaps = previousMonthSwapsRes.totalSwaps || 0;

      const revenuePercentageChange =
        previousMonthRevenue === 0
          ? currentMonthRevenue > 0
            ? 100
            : 0
          : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

      const swapsPercentageChange =
        previousMonthSwaps === 0
          ? currentMonthSwaps > 0
            ? 100
            : 0
          : ((currentMonthSwaps - previousMonthSwaps) / previousMonthSwaps) * 100;

      this.ecommerceMetrics.set({
        customers: {
          // Corresponds to Revenue
          count: currentMonthRevenue,
          percentageChange: revenuePercentageChange,
        },
        orders: {
          // Corresponds to Swaps
          count: currentMonthSwaps,
          percentageChange: swapsPercentageChange,
        },
      });
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
      const [revenue, batterySwaps] = await Promise.all([
        firstValueFrom(
          this.statisticService.getChartData(params.startDate, params.endDate, params.period)
        ),
        firstValueFrom(
          this.statisticService.getBatterySwapData(params.startDate, params.endDate, params.period)
        ),
      ]);

      if (!revenue || !revenue.dataPoints || !batterySwaps || !batterySwaps.dataPoints) {
        this.chartData.set(defaultApexChartData);
        return;
      }

      const newChartData: ApexChartData = {
        categories: revenue.dataPoints.map((p: any) => p.lable),
        series: [
          {
            name: 'Battery Swaps',
            type: 'line',
            data: batterySwaps.dataPoints.map((p: any) => p.value),
          },
          {
            name: 'Revenue (k VND)',
            type: 'line',
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
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dates: Date[] = [];
      const today = new Date();
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Calculate the date of the Monday of the *previous* week
      const previousMonday = new Date(today);
      // Adjust to the current Monday first
      previousMonday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
      // Then subtract 7 days to get to the previous Monday
      previousMonday.setDate(previousMonday.getDate() - 7);

      // Generate the 7 days from previous Monday to previous Sunday
      for (let i = 0; i < 7; i++) {
        const date = new Date(previousMonday);
        date.setDate(previousMonday.getDate() + i);
        dates.push(date);
      }

      const apiCalls = dates.map((date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return firstValueFrom(this.statisticService.getHeatmapData(startOfDay, endOfDay));
      });

      const dailyResults = await Promise.all(apiCalls);

      // The heatmap component expects series for Mon, Tue, etc.
      // Let's create a map to hold the data for each day of the week.
      const seriesMap = new Map<string, number[]>();
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      order.forEach((day) => seriesMap.set(day, Array(24).fill(0))); // Initialize with empty data

      dailyResults.forEach((result, index) => {
        if (!result || !result.dataPoints) return;

        const date = dates[index];
        const dayName = dayNames[date.getDay()];
        const hourlyData = Array(24).fill(0);

        result.dataPoints.forEach((dp: any) => {
          const hour = parseInt(dp.lable.split(':')[0]);
          if (!isNaN(hour) && hour >= 0 && hour < 24) {
            hourlyData[hour] = dp.value;
          }
        });
        seriesMap.set(dayName, hourlyData);
      });

      const finalSeries = order.map((dayName) => ({
        name: dayName,
        data: seriesMap.get(dayName) || Array(24).fill(0),
      }));

      const categories = Array.from({ length: 24 }, (_, i) => i.toString());

      this.heatmapData.set({
        series: finalSeries,
        categories: categories,
      });
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
