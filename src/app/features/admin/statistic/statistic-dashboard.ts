import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { SidebarComponent } from '../../../shared/sidebar/sidebar';
import { HeatmapComponent } from '../../../shared/components/statistic/heat-map/heat-map.component';
import { EcommerceMetricsComponent } from '../../../shared/components/statistic/ecommerce-metrics/ecommerce-metrics.component';
import { StatisticsChartComponent } from '../../../shared/components/statistic/statics-chart/statics-chart.component';

@Component({
  selector: 'app-statistic-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // Header,
    // Footer,
    // SidebarComponent,
    HeatmapComponent,
    EcommerceMetricsComponent,
    StatisticsChartComponent,
  ],
  templateUrl: './statistic-dashboard.html',
  styleUrls: ['./statistic-dashboard.css'],
})
export class StatisticDashboardComponent {}
