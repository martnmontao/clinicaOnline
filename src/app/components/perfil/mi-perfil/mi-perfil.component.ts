import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { MisHorariosComponent } from '../mis-horarios/mis-horarios.component';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
//import { variable64 } from "../../assets/img";
import Swal from 'sweetalert2';
import { BotonAnimadoDirective } from '../../../directives/boton-animado.directive';
import { NombreFormateadoPipe } from '../../../pipes/nombre-formateado.pipe';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule,BotonAnimadoDirective, NombreFormateadoPipe],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  
  user: any;
  patientsAppointment: any = [];
  showMedicalHistory: boolean = false;
  appointmentsFiltered: any = [];
  filterValue: string = "";
  constructor(private firebaseService: FirebaseService)
  {
  }
    
  async ngOnInit() 
  {
    this.user = await this.firebaseService.getUserLogged();

    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [
      { key: 'patient.uid', value: this.user.uid },
      { key: 'state', value: 'Realizado' }
    ],
    'appointments'
  );

  // 🔹 Dejar solo una entrada por especialista + especialidad
  const uniqueMap = new Map();

  for (const turno of this.patientsAppointment) {
    const specialistUid = turno.specialist?.uid;
    const speciality = turno.speciality;
    const key = `${specialistUid}_${speciality}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, turno);
    }
  }

  this.patientsAppointment = Array.from(uniqueMap.values());
    
    this.appointmentsFiltered = this.patientsAppointment;
  }

  
filterAppointments() {
  const value = this.filterValue.toLowerCase().trim();

  if (!value) {
    this.appointmentsFiltered = [...this.patientsAppointment];
    return;
  }



this.appointmentsFiltered.forEach((a: any, i: number) => {
  if (typeof a.speciality !== 'string') {
    console.warn('⚠️ Turno con speciality no string en índice', i, a.speciality);
  }
});
 this.appointmentsFiltered = this.appointmentsFiltered.filter((a: any) => {

  const speciality = a.speciality?.toLowerCase() || '';
 
  return (
    speciality.includes(value) || ''
  );
});

}
async downloadPDFByAppointment(appointment: any) {
  const patient = this.user; // el paciente logueado
  const selectedSpecialist = appointment.specialist;
  const selectedSpeciality = appointment.speciality;

  // 🔹 Obtener todos los turnos realizados del paciente
  const appointmentsList = await this.firebaseService.getDocumentsWithFilters(
    [
      { key: 'patient.uid', value: patient.uid },
      { key: 'state', value: 'Realizado' }
    ],
    'appointments'
  );

  if (!appointmentsList || appointmentsList.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin turnos registrados',
      text: 'No hay turnos finalizados para generar una historia clínica.',
      timer: 2000,
      showConfirmButton: false,
    scrollbarPadding: false,
    backdrop: false,
    customClass: {
      container: 'swal2-container-absolute',
      popup: 'my-swal-popup'
    }
    });
    return;
  }

  // 🔹 Filtrar turnos del mismo especialista y especialidad
  const filteredAppointments = appointmentsList.filter(
    (turno: any) =>
      turno.specialist?.uid === selectedSpecialist.uid &&
      turno.speciality === selectedSpeciality
  );

  if (filteredAppointments.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin registros encontrados',
      text: `No hay historias clínicas registradas para la especialidad ${selectedSpeciality} con el Dr./Dra. ${selectedSpecialist.lastnameUser}.`,
      timer: 2500,
      showConfirmButton: false
    });
    return;
  }

  // 🔹 Confirmación antes de generar el PDF
  const result = await Swal.fire({
    icon: 'question',
    title: '¿Desea descargar la historia clínica?',
    text: `Se generará un PDF con los turnos atendidos por el Dr./Dra. ${selectedSpecialist.lastnameUser} (${selectedSpeciality}).`,
    showCancelButton: true,
    confirmButtonText: 'Sí, descargar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#004d40',
    cancelButtonColor: '#d33',
    scrollbarPadding: false,
    backdrop: false,
    customClass: {
      container: 'swal2-container-absolute',
      popup: 'my-swal-popup'
    }
  });

  if (!result.isConfirmed) return;

  // 🧩 Importar jsPDF y autoTable
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();

  // 🧩 Logo
  const logoUrl = '/images/logoClinica.png';
  const logo = new Image();
  logo.src = logoUrl;

  await new Promise<void>((resolve) => {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 15, 10, 40, 25);
      resolve();
    };
  });

  // 🧩 Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 77, 64);
  doc.text('Clínica Online', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Historia clínica - ${selectedSpeciality}`,
    105,
    35,
    { align: 'center' }
  );

  doc.setFontSize(11);
  doc.text(
    `Paciente: ${patient.nameUser} ${patient.lastnameUser}`,
    105,
    42,
    { align: 'center' }
  );
  doc.text(
    `Especialista: Dr./Dra. ${selectedSpecialist.lastnameUser}, ${selectedSpecialist.nameUser}`,
    105,
    48,
    { align: 'center' }
  );

  // 🧩 Ordenar turnos por fecha
  const sortedAppointments = filteredAppointments.sort((a: any, b: any) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  let y = 60;

  // 🧩 Mostrar cada turno
  for (let i = 0; i < sortedAppointments.length; i++) {
    const turno = sortedAppointments[i];

    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 77, 64);
    doc.text(`Turno ${i + 1}`, 15, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const lines = [
      `Fecha: ${turno.date || '-'}`,
      `Hora: ${turno.hour || '-'}`,
      `Estado: ${turno.state || '-'}`,
    ];

    for (const line of lines) {
      doc.text(line, 20, y);
      y += 5;
    }

    // 🔹 Historia clínica
    if (turno.medicalHistory) {
      const mh = turno.medicalHistory;
      doc.setFont('helvetica', 'bold');
      doc.text('Historia Clínica:', 20, y);
      y += 5;
      doc.setFont('helvetica', 'normal');

      const vitalSigns = [
        `Altura: ${mh.height || '-'}`,
        `Peso: ${mh.weight || '-'}`,
        `Presión: ${mh.pressure || '-'}`,
        `Temperatura: ${mh.temperature || '-'}`,
      ];

      for (const line of vitalSigns) {
        doc.text(line, 25, y);
        y += 5;
      }

      // 🔹 Datos adicionales dinámicos (solo valores)
      for (let j = 1; j <= 3; j++) {
        const value = mh[`valueAdditionalData${j}`];
        if (value) {
          doc.text(`• ${value}`, 25, y);
          y += 5;
        }
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120);
      doc.text('Sin historia clínica registrada.', 25, y);
      y += 5;
    }

    // 🔹 Separador
    doc.setDrawColor(200);
    doc.line(15, y + 2, 195, y + 2);
    y += 10;
  }

  // 🧩 Footer
  const fechaActual = new Date().toLocaleDateString();
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado el ${fechaActual}`, 15, 285);

  // 🧩 Descargar PDF
  doc.save(
    `HistoriaClinica_${selectedSpeciality}_${selectedSpecialist.lastnameUser}_${patient.lastnameUser}.pdf`
  );

  // 🧩 Swal de éxito
  Swal.fire({
    icon: 'success',
    title: 'PDF generado',
    text: 'El historial clínico se descargó correctamente.',
    timer: 2000,
    showConfirmButton: false,
    scrollbarPadding: false,
    backdrop: false,
    customClass: {
      container: 'swal2-container-absolute',
      popup: 'my-swal-popup'
    }
  });
}

}
