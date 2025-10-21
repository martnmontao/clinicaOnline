import { Component } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-mis-turnos-especialista',
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrl: './mis-turnos-especialista.component.css'
})
export class MisTurnosEspecialistaComponent {
  userLogged: any;
  patientsAppointment: any = [];
  specialityFilters:any = [];
  patiensFilters: any = [];
  dateFilters: any = [];
  hourFilters: any = [];
  stateFilters: any = [];
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

  constructor(private firebaseService: FirebaseService)
  {
    
  }

  async ngOnInit(){
    this.userLogged = await this.firebaseService.getUserLogged();
    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
      'appointment' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
    console.log(this.appointmentsFiltered)
    this.specialityFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.specialityType))
    ];

    this.patiensFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.patient.nameUser))
    ];

    this.dateFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.date))
    ];
    this.hourFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.hour))
    ];
    this.stateFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.state))
    ];
  } 


  async filterSpecialities(speciality: string) 
  {
    this.filterSpecialitySelected = speciality;
     const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.specialityType === speciality);
    
    this.appointmentsFiltered = filteredAppointments;
 
  }


  async filterPatient(patient: string)
  {
    
    this.filterPatientSelected = patient;
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.patient.nameUser === patient);

    this.appointmentsFiltered = filteredAppointments;

  }

  async filterHour(hour: string)
  {
    
    this.filterPatientSelected = hour;
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.hour === hour);

    this.appointmentsFiltered = filteredAppointments;

  }

  async filterDate(date: string)
  {
    
    this.filterPatientSelected = date;
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.date === date);

    this.appointmentsFiltered = filteredAppointments;

  }

  async filterState(state: string)
  {
    
    this.filterPatientSelected = state;
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.state === state);

    this.appointmentsFiltered = filteredAppointments;

  }


  async changeStateAppointment()
  {
    
    this.firebaseService.updateDocument('appointment', this.patientSelected.id, 
      {
        state: this.stateAppointmentSelected,
        specialistReview: this.review
      }
    )
     this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
      'appointment' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
  }
  
  showContainer(container: string)
  {
    switch(container)
    {
      case "actions":
        this.showActionSpecialist = !this.showActionSpecialist;
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


  async sendMedicalHistory()
  {
    
  this.firebaseService.updateDocument('appointment', this.patientSelected.id, 
    {
      medicalHistory: {
        weight: this.patientHeight,
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
      }
    )
    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'specialist.uid', value: this.userLogged.uid }],
      'appointment' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
  }

  

  

}
