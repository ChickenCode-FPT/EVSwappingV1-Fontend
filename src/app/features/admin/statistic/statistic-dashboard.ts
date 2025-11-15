import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HeatmapComponent } from '../../../shared/components/statistic/heat-map/heat-map.component';
import { EcommerceMetricsComponent } from '../../../shared/components/statistic/ecommerce-metrics/ecommerce-metrics.component';
import { StatisticsChartComponent } from '../../../shared/components/statistic/statics-chart/statics-chart.component';
import { StatisticService } from './services/statistic.service';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import {
  ApexChartData,
  EcommerceMetrics,
  HeatmapData,
} from './models/statistic.model';

// Define default empty data objects
const defaultEcommerceMetrics: EcommerceMetrics = {
  customers: { count: 0, percentageChange: 0 },
  orders: { count: 0, percentageChange: 0 },
};

const defaultApexChartData: ApexChartData = {
  series: [],
  categories: [],
};

const defaultHeatmapData: HeatmapData = {
  series: [],
  categories: [],
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
    AsyncPipe,
  ],
  templateUrl: './statistic-dashboard.html',
  styleUrls: ['./statistic-dashboard.css'],
})
export class StatisticDashboardComponent {
  private statisticService = inject(StatisticService);

  public ecommerceMetrics$: Observable<EcommerceMetrics> = this.statisticService.getEcommerceMetrics().pipe(
    map(data => data || defaultEcommerceMetrics),
    startWith(defaultEcommerceMetrics),
    catchError(() => of(defaultEcommerceMetrics))
  );

  public chartData$: Observable<ApexChartData> = this.statisticService.getChartData().pipe(
    map(data => data || defaultApexChartData),
    startWith(defaultApexChartData),
    catchError(() => of(defaultApexChartData))
  );

  public heatmapData$: Observable<HeatmapData> = this.statisticService.getHeatmapData().pipe(
    map(data => data || defaultHeatmapData),
    startWith(defaultHeatmapData),
    catchError(() => of(defaultHeatmapData))
  );
}
