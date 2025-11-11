import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import Chart from 'chart.js/auto';
const MAIN_COLOR = '#1F2937'; // fondo principal
const TEXT_COLOR = '#FFFFFF'; // textos
const HEADER_BG = '#374151'; // encabezado tabla
const ROW_BG1 = '#4B5563'; // fila par
const ROW_BG2 = '#6B7280'; // fila impar
const BORDER_COLOR = '#9CA3AF';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-graficos',
  imports: [CommonModule, FormsModule],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css'
})
export class GraficosComponent implements OnInit{
  @ViewChild('barChartLoginsRef') barChartLoginsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartTurnosRef') barChartTurnosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartTurnosPorDiaRef') barChartTurnosPorDiaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartTurnosPorMedicoRef') barChartTurnosPorMedicoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartTurnosCompletadosRef') barChartTurnosCompletadosRef!: ElementRef<HTMLCanvasElement>;
chartTurnosCompletadosPorMedico!: Chart;
chartTurnosPorMedico!: Chart;
chartTurnosPorDia!: Chart;
  chartLogins!: Chart;
  chartTurnos!: Chart;
  specialities: any = [];
  loginsData: any[] = [];
  userLogins: { nombre: string, fechaHora: string }[] = [];
  fechaInicio: string = '01/11/2025';
  fechaFin: string = '30/11/2025';
  fechaInicioTurno: string = '01/11/2025';
  fechaFinTurno: string = '30/11/2025';
  loading: boolean = false;
  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    this.specialities = await this.firebaseService.getAllUniqueSpecialities();
    console.log(this.specialities)
  }

  async ngAfterViewInit() {
    this.loading = true;
    await this.createUsersGraphics();
    await this.createSpecialitiesGraphics();
    await this.createAppointmentsDiaGraphics();
    await this.filtrarTurnos();
    await this.filtrarTurnosFinalizados();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  async filtrarTurnos() {
    await this.createAppointmentsSpecialistGraphics(this.fechaInicio, this.fechaFin);
  }

  async filtrarTurnosFinalizados()
  {
    await this.createCompletedAppointmentsBySpecialist(this.fechaInicioTurno, this.fechaFinTurno);
  }
  async createUsersGraphics() {
    this.loginsData = await this.firebaseService.getCollection('logins');
    const usersPromises = this.loginsData.map(login =>
      this.firebaseService.getUserByUID(login.uid, 'users')
    );
    const users = await Promise.all(usersPromises);

    const counts: { [name: string]: number } = {};
    this.userLogins = [];

    users.forEach((user, index) => {
      const login = this.loginsData[index];
      const nombre = user ? `${user.nameUser} ${user.lastnameUser}` : 'Desconocido';
      counts[nombre] = (counts[nombre] || 0) + 1;

      this.userLogins.push({
        nombre,
        fechaHora: `${login.fecha} ${login.hora}`
      });
    });

    // Ordenar por fecha y hora
    this.userLogins.sort((a, b) => {
      const [da, ma, ya] = a.fechaHora.split(' ')[0].split('/').map(Number);
      const [ha, maA] = a.fechaHora.split(' ')[1].split(':').map(Number);
      const [db, mb, yb] = b.fechaHora.split(' ')[0].split('/').map(Number);
      const [hb, mbB] = b.fechaHora.split(' ')[1].split(':').map(Number);

      const dateA = new Date(ya, ma - 1, da, ha, maA).getTime();
      const dateB = new Date(yb, mb - 1, db, hb, mbB).getTime();

      return dateB - dateA; // orden ascendente
    });

    this.chartLogins = new Chart(this.barChartLoginsRef.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Cantidad de ingresos',
          data: Object.values(counts),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          title: { display: true, text: 'Ingresos por usuario' }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico de turnos por especialidad
  async createSpecialitiesGraphics() {
    const turnos = await this.firebaseService.getCollection('appointments');

    const counts: { [speciality: string]: number } = {};
    turnos.forEach(turno => {
      const spec = turno.speciality || 'Sin Especialidad';
      counts[spec] = (counts[spec] || 0) + 1;
    });

    this.chartTurnos = new Chart(this.barChartTurnosRef.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Cantidad de turnos',
          data: Object.values(counts),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          title: { display: true, text: 'Turnos por especialidad' }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
}

async createAppointmentsDiaGraphics() {

  const turnos = await this.firebaseService.getCollection('appointments');


  const counts: { [fecha: string]: number } = {};
  turnos.forEach(turno => {
    const fecha = turno.date || 'Sin Fecha';
    counts[fecha] = (counts[fecha] || 0) + 1;
  });

  // Crear el gráfico
  this.chartTurnosPorDia = new Chart(this.barChartTurnosPorDiaRef.nativeElement, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Cantidad de turnos',
        data: Object.values(counts),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        title: { display: true, text: 'Cantidad de turnos por día' }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async createAppointmentsSpecialistGraphics(startDate: string, endDate: string) {
  const turnos = await this.firebaseService.getCollection('appointments');

  // Parseamos las fechas de inicio y fin de manera local
  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.includes('-') 
      ? dateStr.split('-').map(Number)  // YYYY-MM-DD
      : dateStr.split('/').reverse().map(Number); // DD/MM/YYYY
    return new Date(year, month - 1, day);
  };

  const fechaInicio = parseDate(startDate);
  const fechaFin = parseDate(endDate);

  const turnosFiltrados = turnos.filter(turno => {
    const [day, month, year] = turno.date.split('/').map(Number);
    const turnoFecha = new Date(year, month - 1, day); // Mes empieza en 0
    return turnoFecha >= fechaInicio && turnoFecha <= fechaFin;
  });

  console.log(turnos);
  console.log(turnosFiltrados);

  const counts: { [medico: string]: number } = {};
  turnosFiltrados.forEach(turno => {
    const medico = turno.specialist
      ? `${turno.specialist.nameUser} ${turno.specialist.lastnameUser}`
      : 'Sin Médico';
    counts[medico] = (counts[medico] || 0) + 1;
  });

  if(this.chartTurnosPorMedico) {
    this.chartTurnosPorMedico.destroy();
  }

  // Formatear las fechas para el título
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Enero = 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const startFormatted = formatDate(fechaInicio);
  const endFormatted = formatDate(fechaFin);

  this.chartTurnosPorMedico = new Chart(this.barChartTurnosPorMedicoRef.nativeElement, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Turnos por médico',
        data: Object.values(counts),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        title: { display: true, text: `Turnos por médico (${startFormatted} - ${endFormatted})` }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async createCompletedAppointmentsBySpecialist(startDate: string, endDate: string) {
  const turnos = await this.firebaseService.getCollection('appointments');

  // Función para convertir fechas, admite YYYY-MM-DD (input) y DD/MM/YYYY (Firebase)
  const parseDate = (dateStr: string): Date => {
    if (dateStr.includes('-')) {
      // Input type="date" -> YYYY-MM-DD
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    } else {
      // Firebase -> DD/MM/YYYY
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
  };

  const fechaInicio = parseDate(startDate);
  const fechaFin = parseDate(endDate);

  // Filtrar turnos finalizados dentro del rango
  const turnosFiltrados = turnos.filter(turno => {
    const turnoFecha = parseDate(turno.date);
    return turnoFecha >= fechaInicio && turnoFecha <= fechaFin && turno.state === 'Realizado';
  });

  // Contar por médico
  const counts: { [medico: string]: number } = {};
  turnosFiltrados.forEach(turno => {
    const medico = turno.specialist
      ? `${turno.specialist.nameUser} ${turno.specialist.lastnameUser}`
      : 'Sin Médico';
    counts[medico] = (counts[medico] || 0) + 1;
  });

  // Destruir gráfico previo si existe
  if (this.chartTurnosCompletadosPorMedico) {
    this.chartTurnosCompletadosPorMedico.destroy();
  }

  // Formatear fechas para el título
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const startFormatted = formatDate(fechaInicio);
  const endFormatted = formatDate(fechaFin);

  // Crear gráfico
  this.chartTurnosCompletadosPorMedico = new Chart(this.barChartTurnosCompletadosRef.nativeElement, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Turnos finalizados por médico',
        data: Object.values(counts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Turnos finalizados por médico (${startFormatted} - ${endFormatted})` }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}
async generatePDFLogins() {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 🔹 Logo de la clínica
  const logo = new Image();
  logo.src = '/images/logoClinica.png';
  await new Promise<void>(resolve => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 35, 25);
      resolve();
    };
  });

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55); // #1F2937
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Gráficos y estadísticas', 105, 32, { align: 'center' });
  yOffset = 45;

  // 🔹 Captura del gráfico
  const canvas = this.barChartLoginsRef.nativeElement;
  const canvasImage = await html2canvas(canvas);
  const imgData = canvasImage.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 15, yOffset, pdfWidth, pdfHeight);
  yOffset += pdfHeight + 10;

  // 🔹 Tabla de datos
  const columns = ['Nombre', 'Fecha y hora'];
  const colWidth = pdfWidth / columns.length;
  const rowHeight = 7;

  const tableData = this.userLogins.map(row => [
    row.nombre,
    row.fechaHora
  ]);

  autoTable(doc, {
    startY: yOffset,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255] // casi transparente
    },
    headStyles: {
      fillColor: [31, 41, 55], // #1F2937
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });

  // 🔹 Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Ingresos_por_usuario_${new Date().toLocaleDateString()}.pdf`);
}

async generatePDFSpecialities() {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 🔹 Logo
  const logo = new Image();
  logo.src = '/images/logoClinica.png';
  await new Promise<void>(resolve => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 35, 25);
      resolve();
    };
  });

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Gráficos y estadísticas', 105, 32, { align: 'center' });
  yOffset = 45;

  // 🔹 Captura del gráfico
  const canvas = this.barChartTurnosRef.nativeElement;
  const canvasImage = await html2canvas(canvas);
  const imgData = canvasImage.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 15, yOffset, pdfWidth, pdfHeight);
  yOffset += pdfHeight + 10;

  // 🔹 Tabla de datos
  const turnos = await this.firebaseService.getCollection('appointments');
  const counts: { [speciality: string]: number } = {};
  turnos.forEach(turno => {
    const spec = turno.speciality || 'Sin Especialidad';
    counts[spec] = (counts[spec] || 0) + 1;
  });
  const tableData = Object.keys(counts).map(spec => [spec, counts[spec]]);

  const columns = ['Especialidad', 'Cantidad'];
  autoTable(doc, {
    startY: yOffset,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255]
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Turnos_por_especialidad_${new Date().toLocaleDateString()}.pdf`);
}

async generatePDFTurnosPorDia() {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 🔹 Logo
  const logo = new Image();
  logo.src = '/images/logoClinica.png';
  await new Promise<void>(resolve => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 30, 25);
      resolve();
    };
  });

  // Título y subtítulo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Gráficos y estadísticas', 105, 32, { align: 'center' });

  yOffset = 45;

  // 🔹 Captura del gráfico
  const canvas = this.barChartTurnosPorDiaRef.nativeElement;
  const canvasImage = await html2canvas(canvas);
  const imgData = canvasImage.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 15, yOffset, pdfWidth, pdfHeight);
  yOffset += pdfHeight + 10;

  // 🔹 Tabla de datos
  const turnos = await this.firebaseService.getCollection('appointments');
  const counts: { [fecha: string]: number } = {};
  turnos.forEach(t => {
    const fecha = t.date || '-';
    counts[fecha] = (counts[fecha] || 0) + 1;
  });

  const tableData = Object.keys(counts).map(f => [f, counts[f]]);
  const columns = ['Fecha', 'Cantidad'];

  autoTable(doc, {
    startY: yOffset,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255]
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Turnos_por_dia_${new Date().toLocaleDateString()}.pdf`);
}

// 4️⃣ PDF Turnos finalizados por médico
async generatePDFTurnosCompletados() {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 🔹 Logo
  const logo = new Image();
  logo.src = '/images/logoClinica.png';
  await new Promise<void>(resolve => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 30, 25);
      resolve();
    };
  });

  // Título y subtítulo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Gráficos y estadísticas', 105, 32, { align: 'center' });

  yOffset = 45;

  // 🔹 Captura del gráfico
  const canvas = this.barChartTurnosCompletadosRef.nativeElement;
  const canvasImage = await html2canvas(canvas);
  const imgData = canvasImage.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 15, yOffset, pdfWidth, pdfHeight);
  yOffset += pdfHeight + 10;

  // 🔹 Tabla de datos
  const parseDate = (s: string): Date => {
  if (!s) return new Date();

  if (s.includes('-')) {
    // YYYY-MM-DD
    const [year, month, day] = s.split('-').map(Number);
    return new Date(year, month - 1, day);
  } else {
    // DD/MM/YYYY
    const [day, month, year] = s.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
};
  const fechaInicio = parseDate(this.fechaInicioTurno);
  const fechaFin = parseDate(this.fechaFinTurno);

  const turnos = await this.firebaseService.getCollection('appointments');
  const filtered = turnos.filter(t => parseDate(t.date) >= fechaInicio && parseDate(t.date) <= fechaFin && t.state === 'Realizado');

  const counts: { [medico: string]: number } = {};
  filtered.forEach(t => {
    const m = t.specialist ? `${t.specialist.nameUser} ${t.specialist.lastnameUser}` : 'Sin Médico';
    counts[m] = (counts[m] || 0) + 1;
  });

  const tableData = Object.keys(counts).map(m => [m, counts[m]]);
  const columns = ['Medico', 'Cantidad'];

  autoTable(doc, {
    startY: yOffset,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255]
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Turnos_finalizados_por_medico_${new Date().toLocaleDateString()}.pdf`);
}

async generatePDFTurnosPorMedico() {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yOffset = 15;

  // 🔹 Logo
  const logo = new Image();
  logo.src = '/images/logoClinica.png';
  await new Promise<void>(resolve => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 30, 25);
      resolve();
    };
  });

  // Título y subtítulo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Gráficos y estadísticas', 105, 32, { align: 'center' });

  yOffset = 45;

  // 🔹 Captura del gráfico
  const canvas = this.barChartTurnosPorMedicoRef.nativeElement;
  const canvasImage = await html2canvas(canvas);
  const imgData = canvasImage.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  doc.addImage(imgData, 'PNG', 15, yOffset, pdfWidth, pdfHeight);
  yOffset += pdfHeight + 10;

  // 🔹 Tabla de datos
  const parseDate = (s: string): Date => {
    if (!s) return new Date();
    if (s.includes('-')) {
      const [year, month, day] = s.split('-').map(Number);
      return new Date(year, month - 1, day);
    } else {
      const [day, month, year] = s.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
  };

  const fechaInicio = parseDate(this.fechaInicio);
  const fechaFin = parseDate(this.fechaFin);

  const turnos = await this.firebaseService.getCollection('appointments');
  const filtered = turnos.filter(t => {
    const turnoFecha = parseDate(t.date);
    return turnoFecha >= fechaInicio && turnoFecha <= fechaFin;
  });

  // Contar turnos por médico
  const counts: { [medico: string]: number } = {};
  filtered.forEach(t => {
    const m = t.specialist ? `${t.specialist.nameUser} ${t.specialist.lastnameUser}` : 'Sin Médico';
    counts[m] = (counts[m] || 0) + 1;
  });

  const tableData = Object.keys(counts).map(m => [m, counts[m]]);
  const columns = ['Medico', 'Cantidad'];

  autoTable(doc, {
    startY: yOffset,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255]
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 15, right: 15 }
  });

  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Turnos_por_medico_${new Date().toLocaleDateString()}.pdf`);
}
}
