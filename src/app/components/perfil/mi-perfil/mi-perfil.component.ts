import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { MisHorariosComponent } from '../mis-horarios/mis-horarios.component';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
//import { variable64 } from "../../assets/img";

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  
  user: any;
  patientsAppointment: any = [];
  showMedicalHistory: boolean = false;
  constructor(private firebaseService: FirebaseService)
  {
  }
    
  async ngOnInit() 
  {
    this.user = await this.firebaseService.getUserLogged();

    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'patient.uid', value: this.user.uid },
      { key: 'state', value: 'Realizado'}
    ],
      'appointments' 
    );
  }

onGeneratePDF(appointment: any) {
  const doc = new jsPDF();


  const logo = '/images/logoClinica.png';
  doc.addImage(logo, 'PNG', 10, 10, 35, 25);


  doc.setFontSize(18);
  doc.text('Historia Clínica', 40, 20);


  const fechaEmision = new Date().toLocaleDateString();
  doc.setFontSize(11);
  doc.text(`Emitido el: ${fechaEmision}`, 40, 28);

  const yStart = 40;
  doc.setFontSize(13);
  doc.text('Datos del Turno:', 14, yStart);
  doc.setFontSize(11);
  doc.text(`Fecha: ${appointment.date}`, 14, yStart + 8);
  doc.text(`Hora: ${appointment.hour}`, 14, yStart + 14);
  doc.text(`Estado: ${appointment.state}`, 14, yStart + 20);
  doc.text(`Especialidad: ${appointment.speciality}`, 14, yStart + 26);


  const patient = appointment.patient;
  doc.setFontSize(13);
  doc.text('Paciente:', 14, yStart + 38);
  doc.setFontSize(11);
  doc.text(`Nombre: ${patient.nameUser} ${patient.lastnameUser || ''}`, 14, yStart + 46);
  doc.text(`Documento: ${patient.documentUser}`, 14, yStart + 52);
  doc.text(`Obra social: ${patient.socialWorkUser}`, 14, yStart + 58);


  const specialist = appointment.specialist;
  doc.setFontSize(13);
  doc.text('Especialista:', 14, yStart + 70);
  doc.setFontSize(11);
  doc.text(`Nombre: ${specialist.nameUser} ${specialist.lastnameUser || ''}`, 14, yStart + 78);
  doc.text(`Documento: ${specialist.documentUser}`, 14, yStart + 84);


  const h = appointment.medicalHistory;
  const rows = [
    ['Altura', h.height],
    ['Peso', h.weight],
    ['Presión', h.pressure],
    ['Temperatura', h.temperature],
    [h.keyAdditionalData1, h.valueAdditionalData1],
    [h.keyAdditionalData2, h.valueAdditionalData2],
    [h.keyAdditionalData3, h.valueAdditionalData3],
  ];

  autoTable(doc, {
    startY: yStart + 92,
    head: [['Parámetro', 'Valor']],
    body: rows,
    styles: { halign: 'center' },
    headStyles: { fillColor: [31, 41, 55] }, 
  });


  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text('Observaciones del Especialista:', 14, finalY);
  doc.setFontSize(11);
  doc.text(appointment.specialistReview || 'Sin observaciones', 14, finalY + 8);


  doc.save(`HistoriaClinica_${patient.nameUser}_${appointment.date}.pdf`);
}

}
