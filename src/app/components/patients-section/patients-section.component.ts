import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { BotonAnimadoDirective } from '../../directives/boton-animado.directive';
import { NombreFormateadoPipe } from '../../pipes/nombre-formateado.pipe';
@Component({
  selector: 'app-patients-section',
  imports: [CommonModule, BotonAnimadoDirective, NombreFormateadoPipe],
  templateUrl: './patients-section.component.html',
  styleUrl: './patients-section.component.css'
})
export class PatientsSectionComponent implements OnInit {
  
  user: any;
  patientsList: any = [];
  loading: boolean = false;
  showAppointments: boolean = false;
  constructor(private firebaseService: FirebaseService)
  {
  }


async ngOnInit() {
    this.loading = true;
    this.user = await this.firebaseService.getUserLogged();

    const appointments = await this.firebaseService.getDocumentsWithFilters(
      [{ key: 'specialist.uid', value: this.user.uid }],
      'appointments'
    );

    const uniquePatientsMap = new Map();

    appointments.forEach((turno: any) => {
      const patientUid = turno.patient?.uid;
      if (!patientUid) return;

      // Solo considerar turnos "Realizado"
      if (turno.state !== 'Realizado') return;

      if (!uniquePatientsMap.has(patientUid)) {
        uniquePatientsMap.set(patientUid, {
          ...turno.patient,
          appointments: [turno]
        });
      } else {
        uniquePatientsMap.get(patientUid).appointments.push(turno);
      }
    });

    // Ordenar los turnos y obtener los últimos 3
    uniquePatientsMap.forEach((patient: any) => {
      patient.appointments.sort((a: any, b: any) => {
        const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
        return dateB - dateA;
      });
      patient.lastAppointments = patient.appointments.slice(0, 3);
    });

    this.patientsList = Array.from(uniquePatientsMap.values());
    setTimeout(() => {
      
      this.loading = false;
    }, 1100);
}

async downloadPDFPatients(patient: any) {
  const appointmentsList = await this.firebaseService.getAppointmentsByPatientUid(patient.uid);
  const currentSpecialistUid = this.user.uid; // especialista logueado

  // 🧩 Caso sin turnos
  if (!appointmentsList || appointmentsList.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin turnos registrados',
      text: 'Este paciente no tiene turnos cargados en el sistema.',
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

  // 🧩 Filtrar solo los turnos del especialista actual que estén realizados y tengan historia clínica
  const filteredAppointments = appointmentsList.filter(
    (turno: any) =>
      turno.specialist?.uid === currentSpecialistUid &&
      turno.state === 'Realizado' &&
      turno.medicalHistory
  );

  if (filteredAppointments.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin registros propios',
      text: 'No hay historias clínicas cargadas por usted para este paciente.',
      timer: 2500,
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

  // 🧩 Avisar si hay turnos con otros especialistas
  if (filteredAppointments.length < appointmentsList.length) {
    Swal.fire({
      icon: 'info',
      title: 'Atención',
      text: 'Este paciente tiene turnos con otros especialistas que no se incluirán en este PDF.',
      timer: 3000,
      showConfirmButton: false,
      scrollbarPadding: false,
      backdrop: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
  }

  const result = await Swal.fire({
    icon: 'question',
    title: '¿Desea descargar la historia clínica?',
    text: `Se generará un PDF con los turnos atendidos por usted para ${patient.nameUser} ${patient.lastnameUser}.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, descargar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#004d40',
    cancelButtonColor: '#d33',
    background: '#fafafa',
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
    `Historia clínica del paciente: ${patient.nameUser} ${patient.lastnameUser}`,
    105,
    35,
    { align: 'center' }
  );

  // 🧩 Ordenar turnos por fecha
  const sortedAppointments = filteredAppointments.sort((a: any, b: any) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  let y = 50;
  const turnosPorPagina = 2; // cada 2 turnos nueva página

  // 🧩 Mostrar cada turno
  for (let i = 0; i < sortedAppointments.length; i++) {
    const turno = sortedAppointments[i];

    // salto de página cada 2 turnos
    if (i !== 0 && i % turnosPorPagina === 0) {
      doc.addPage();
      y = 20;
    }

    // 🔹 Encabezado del turno
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 77, 64);
    doc.text(`Turno ${i + 1}`, 15, y);
    y += 7;

    // 🔹 Datos del turno
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${turno.date || '-'}`, 20, y); y += 6;
    doc.text(`Hora: ${turno.hour || '-'}`, 20, y); y += 6;
    doc.text(`Especialista: ${turno.specialist?.lastnameUser || '-'}, ${turno.specialist?.nameUser || '-'}`, 20, y); y += 6;
    doc.text(`Especialidad: ${turno.speciality || '-'}`, 20, y); y += 6;
    doc.text(`Estado: ${turno.state || '-'}`, 20, y); y += 8;

    // 🔹 Historia clínica
    if (turno.medicalHistory) {
      const mh = turno.medicalHistory;
      doc.setFont('helvetica', 'bold');
      doc.text('Historia Clínica:', 20, y);
      y += 6;
      doc.setFont('helvetica', 'normal');

      const vitalSigns = [
        `Altura: ${mh.height || '-'}`,
        `Peso: ${mh.weight || '-'}`,
        `Presión: ${mh.pressure || '-'}`,
        `Temperatura: ${mh.temperature || '-'}`
      ];
      for (const line of vitalSigns) {
        doc.text(line, 25, y);
        y += 6;
      }

      for (let j = 1; j <= 3; j++) {
      const key = mh[`keyAdditionalData${j}`];
      const value = mh[`valueAdditionalData${j}`];
      if (key && value) {
        doc.text(`${key}: ${value}`, 25, y);
        y += 6;
      }
    }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120);
      doc.text('Sin historia clínica registrada.', 25, y);
      y += 6;
    }

    // 🔹 Separador entre turnos
    doc.setDrawColor(200);
    doc.line(15, y, 195, y);
    y += 10;
  }

  // 🧩 Footer
  const fechaActual = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${fechaActual}`, 15, 285);

  // 🧩 Descargar PDF
  doc.save(`HistoriaClinica_${patient.lastnameUser}_${patient.nameUser}.pdf`);

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

alterToggle(patient:any)

{
    patient.showAppointments = !patient.showAppointments;
}

}
