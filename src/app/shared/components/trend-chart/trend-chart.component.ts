import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.scss']
})
export class TrendChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  @Input() type: ChartType = 'line';
  @Input() data!: ChartData;
  @Input() height: number = 300;
  @Input() options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value: number) => {
            return typeof value === 'number' ? 
              value >= 1000 ? 
                `$${(value / 1000).toFixed(1)}K` : 
                `$${value}` : 
              value;
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
      }
    }
  };

  private chart!: Chart;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.createChart();
  }

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: this.options
    });
  }

  // Public methods for external control
  public updateData(newData: ChartData) {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }

  public updateOptions(newOptions: any) {
    if (this.chart) {
      this.chart.options = { ...this.options, ...newOptions };
      this.chart.update();
    }
  }

  public resize() {
    if (this.chart) {
      this.chart.resize();
    }
  }

  public destroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
