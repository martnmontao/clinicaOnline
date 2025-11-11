import { Component } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoTurnoDirective } from '../../../directives/estado-turno.directive';
import { NombreFormateadoPipe } from '../../../pipes/nombre-formateado.pipe';
import Swal from 'sweetalert2';

import { FiltrarPacientesPipe } from '../../../pipes/filtrar-pacientes.pipe';
import { OrdenarPorFechaPipe } from '../../../pipes/ordenar-por-fecha.pipe';
@Component({
  selector: 'app-mis-turnos-especialista',
  imports: [CommonModule, FormsModule, EstadoTurnoDirective, NombreFormateadoPipe, FiltrarPacientesPipe, OrdenarPorFechaPipe],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.css'
})
export class MisTurnosEspecialistaComponent {
  userLogged: any;
  patientsAppointment: any = [];
  specialityFilters:any = [];
  patiensFilters: any = [];
  datesFilters: any = [];
  hoursFilters: any = [];
  statesFilters: any = [];
  appointmentsFiltered: any = [];
  patientSelected: any;
  showActionSpecialist:boolean = false;
  showReviewSpecialist:boolean = false;
  showReviewPatient:boolean = false;
  showFilters:boolean = false;
  showMedicalHistory: boolean = false;
  buttonActive: boolean = false;
  filterPatientSelected:any;
  filterSpecialitySelected:any;
  review: string = "";
  stateAppointmentSelected:string = "";
  patientWeight: string = "";
  patientHeight: string = "";
  patientTemperature: string = "";
  patientPressure: string = "";
  patientAdditionalData1: string = ""
  patientAdditionalData2: string = ""
  patientAdditionalData3: string = ""
  valueAdditionalData1: string = "";
  valueAdditionalData2: string = "";
  valueAdditionalData3: string = "";
  medicalHistoryAppointment: any;
  filterValue: string = "";
  titleReview: string = "";
  isLoading = false;
  constructor(private firebaseService: FirebaseService)
  {
    
  }

  async ngOnInit(){
    this.isLoading = true;
    this.userLogged = await this.firebaseService.getUserLogged();
    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
      'appointments' 
    );


    this.appointmentsFiltered = this.patientsAppointment;

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  } 



  async changeStateAppointment()
  {
    
    this.firebaseService.updateDocument('appointments', this.patientSelected.id, 
      {
        state: this.stateAppointmentSelected,
        specialistReview: this.review
      }
    )
     this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
      'appointments' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
  }
  
  showContainer(container: string)
  {
    switch(container)
    {
      case "actions":
        this.showActionSpecialist = !this.showActionSpecialist;
        console.log(this.patientSelected)
        break;
      case "reviewSpecialist":
       
        this.review = this.patientSelected.specialistReview;
        this.showReviewSpecialist = !this.showReviewSpecialist;
        break;
      case "reviewPatient":
        this.review = this.patientSelected.patientReview;
        this.showReviewPatient = !this.showReviewPatient;
        break;
      case "filters":
        this.showFilters = !this.showFilters;
        break;
      case "medicalHistory":
        this.showMedicalHistory = !this.showMedicalHistory;
        break;
    }
  }

  sendReview()
  {
    if(this.review != "" && this.review.length > 10)
    {
      this.changeStateAppointment();
    }
  }


async sendMedicalHistory() {

  if (!this.patientHeight || isNaN(Number(this.patientHeight)) || Number(this.patientHeight) < 1) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La altura debe ser un número positivo válido.',
      confirmButtonColor: '#d33',
      confirmButtonText: "Aceptar",    
      backdrop: false,
      scrollbarPadding: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
    return;
  }

  if (!this.patientWeight || isNaN(Number(this.patientWeight)) || Number(this.patientWeight) < 1) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El peso debe ser un número positivo válido.',
      confirmButtonText: "Aceptar",
      confirmButtonColor: '#d33',
      backdrop: false,
      scrollbarPadding: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
    return;
  }

  if (!this.patientPressure || isNaN(Number(this.patientPressure)) || Number(this.patientPressure) < 1) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La presión debe ser un número positivo válido.',
      confirmButtonText: "Aceptar",
      confirmButtonColor: '#d33',
      backdrop: false,
      scrollbarPadding: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
    return;
  }

  if (!this.patientTemperature || isNaN(Number(this.patientPressure)) || Number(this.patientTemperature) < 1) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La temperatura debe ser un número positivo válido.',
      confirmButtonText: "Aceptar",
      confirmButtonColor: '#d33',
      backdrop: false,
      scrollbarPadding: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
    return;
  }

  if (
    (this.patientAdditionalData1 == "" && this.valueAdditionalData1 == "") ||
    (this.patientAdditionalData2 == "" && this.valueAdditionalData2 == "") ||
    (this.patientAdditionalData3 == "" && this.valueAdditionalData3 == "")
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Complete todos los campos.',
      confirmButtonText: "Aceptar",
      confirmButtonColor: '#d33',
      backdrop: false,
      scrollbarPadding: false,
      customClass: {
        container: 'swal2-container-absolute',
        popup: 'my-swal-popup'
      }
    });
    return;
  }


  await this.firebaseService.updateDocument('appointments', this.patientSelected.id, {
    medicalHistory: {
      weight: this.patientWeight,
      height: this.patientHeight,
      temperature: this.patientTemperature,
      pressure: this.patientPressure,
      keyAdditionalData1: this.patientAdditionalData1,
      keyAdditionalData2: this.patientAdditionalData2,
      keyAdditionalData3: this.patientAdditionalData3,
      valueAdditionalData1: this.valueAdditionalData1,
      valueAdditionalData2: this.valueAdditionalData2,
      valueAdditionalData3: this.valueAdditionalData3,
    }
  });


  this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
    'appointments'
  );
  this.appointmentsFiltered = this.patientsAppointment;


  Swal.fire({
    icon: 'success',
    title: 'Datos guardados',
    text: 'La historia clínica se guardó correctamente.',
    timer: 2000,
    showConfirmButton: false,
    backdrop: false,
    scrollbarPadding: false,
    customClass: {
      container: 'swal2-container-absolute',
      popup: 'my-swal-popup'
    }
  });

  this.showMedicalHistory = false;
}

  

  

}
