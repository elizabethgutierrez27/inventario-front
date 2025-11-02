import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReporteService } from '../../services/reporte.service';
import { ChartOptions, ChartData } from 'chart.js';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';


// Interfaz para tipar los productos - ACTUALIZADA
interface Producto {
  id?: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  cantidad?: number;
  stock: number;          // columna real en la tabla
  stock_actual?: number;  // agregado para compatibilidad
  precio?: number;
  proveedor?: string;
  id_categoria?: number;
  categoria_nombre?: string;
  imagen?: string;
  fecha_ingreso?: string;
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  
  // KPIs
  valorInventario: number = 0;
  bajoStock: Producto[] = [];
  masVendidos: any[] = [];

  // Charts - CONFIGURACIÓN MEJORADA
  masVendidosChartData: ChartData<'bar'> = { 
    labels: [], 
    datasets: [{ 
      label: 'Vendidos', 
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.7)'
    }] 
  };

  masVendidosChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // IMPORTANTE para controlar tamaño
    plugins: { 
      legend: { 
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  bajoStockChartData: ChartData<'pie'> = { 
    labels: [], 
    datasets: [{ 
      data: [], 
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'] 
    }] 
  };

  bajoStockChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false, // IMPORTANTE para controlar tamaño
    plugins: { 
      legend: { 
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      } 
    }
  };

  isBrowser: boolean;

  constructor(
    private reporteService: ReporteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.cargarValorInventario();
    this.cargarBajoStock();
    this.cargarMasVendidos();
  }

  formatoMoneda(valor: number): string {
    return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // KPIs
  cargarValorInventario() {
    this.reporteService.getDashboardValorInventario().subscribe((res: any) => {
      this.valorInventario = res?.data?.valor_total || 0;
    });
  }

  // Bajo Stock - CORREGIDO
  cargarBajoStock() {
    this.reporteService.getBajoStock().subscribe((res: any) => {
      const data = res?.data || [];

      console.log('Datos recibidos de bajo stock:', data);

      // Usar los datos directamente del backend (ya vienen filtrados)
      this.bajoStock = data;

      // Preparar datos para Pie Chart - contar productos por categoría
      const categorias: { [key: string]: number } = {};
      this.bajoStock.forEach((prod: Producto) => {
        const cat = prod.categoria_nombre || 'Sin categoría';
        // Contar productos por categoría (más útil que sumar stocks)
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      // Pie chart
      this.bajoStockChartData = {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']
        }]
      };
    });
  }

  // Productos más vendidos
  cargarMasVendidos() {
    this.reporteService.getDashboardMasVendidos().subscribe((res: any) => {
      const chartData = res?.data || { labels: [], datasets: [{ data: [] }] };

      this.masVendidosChartData = {
        labels: chartData.labels,
        datasets: [
          {
            label: chartData.datasets[0]?.label || 'Vendidos',
            data: chartData.datasets[0]?.data || [],
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          }
        ]
      };

      this.masVendidos = chartData.labels.map((nombre: string, i: number) => ({
        nombre,
        total_vendido: chartData.datasets[0]?.data[i] || 0
      }));
    });
  }

  // Exportar reporte
exportReport(tipo: string, formato: 'pdf' | 'excel') {
  const body = { reportType: tipo, format: formato };
  
  this.reporteService.exportReport(body).subscribe((blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tipo}_${formato}_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

async exportAll(format: string) {
  if (format === 'pdf') {
    const element = document.querySelector('.reportes-container') as HTMLElement;

    if (!element) {
      alert('No se encontró el contenido a exportar.');
      return;
    }

    // Captura del dashboard completo
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    // Crear PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('reporte_general.pdf');
  }

  if (format === 'excel') {
    this.exportAllToExcel();
  }
}


exportAllToExcel() {
  const wb = XLSX.utils.book_new();
  const tables = document.querySelectorAll('table.data-table');

  tables.forEach((table: any, index) => {
    const ws = XLSX.utils.table_to_sheet(table);
    const sheetName = `Tabla${index + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, 'reporte_general.xlsx');
}

}