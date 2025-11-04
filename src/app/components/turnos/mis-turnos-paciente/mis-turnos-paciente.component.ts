import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-turnos-paciente',
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-paciente.component.html',
  styleUrl: './mis-turnos-paciente.component.css'
})
export class MisTurnosPacienteComponent implements OnInit {
 
  specialityFilters:any = [];
  userLogged: any;
  patientsAppointment: any = [];
  specialistsFilters: any = [];
  datesFilters: any = [];
  statesFilters: any = [];
  hoursFilters: any = [];

  appointmentsFiltered: any = [];
  showFilters: boolean = false;
  filterSelected:any;
  titleReview: string = "";
  appointmentSelected: any;
  showDetails: boolean = false;
  stateAppointmentSelected: string = "";
  showReviewSpecialist: boolean = false;
  showReviewPatient: boolean = false;

  review:string = "";
  filterValue: string = "";
  constructor(private firebaseService: FirebaseService)
  {
    
  }

  async ngOnInit(){
    this.userLogged = await this.firebaseService.getUserLogged();
    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'patient.uid', value: this.userLogged.uid }],
      'appointments' 
    );
    this.appointmentsFiltered = this.patientsAppointment;
    
  }


  async filterSpecialities(speciality: string) 
  {

     const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.speciality === speciality);
    
    this.appointmentsFiltered = filteredAppointments;

  }

 filterAppointments() {
  const value = this.filterValue?.toLowerCase().trim();

  if (!value) {
    this.appointmentsFiltered = [...this.patientsAppointment];
    return;
  }

  this.appointmentsFiltered = this.patientsAppointment.filter((a: any) => {
    const specialistName = a.specialist.nameUser?.toLowerCase() || '';
    const specialistLastname = a.specialist.lastnameUser?.toLowerCase() || '';
    const speciality = a.speciality?.toLowerCase() || '';
    const day = a.date?.toLowerCase() || '';
    const time = a.hour?.toLowerCase() || '';
    const status = a.state?.toLowerCase() || '';

  
    let medicalMatch = false;
    if (a.medicalHistory) {
      const historyValues = Object.values(a.medicalHistory)
        .filter(v => typeof v === 'string') 
        .map(v => v.toLowerCase());

      medicalMatch = historyValues.some((v: string) => v.includes(value));
    }

    return (
      specialistName.includes(value) ||
      specialistLastname.includes(value) ||
      speciality.includes(value) ||
      day.includes(value) ||
      time.includes(value) ||
      status.includes(value) ||
      medicalMatch
    );
  });
}

  async filterSpecialist(specialist: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.specialist.nameUser === specialist);
    
    this.appointmentsFiltered = filteredAppointments;


  }
   async filterSpeciality(specialist: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.specialist.nameUser === specialist);
    
    this.appointmentsFiltered = filteredAppointments;
      

  } async filterDate(date: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.date === date);
    
    this.appointmentsFiltered = filteredAppointments;
      

  } async filterHour(hour: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.hour === hour);
    
    this.appointmentsFiltered = filteredAppointments;
      

  }

   async filterState(state: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.state === state);
    
    this.appointmentsFiltered = filteredAppointments;
      

  }

  showContainer(container: string)
  {
    switch(container)
    {
      case 'filters':
        this.showFilters = !this.showFilters;
        break;
      case "details":
        this.showDetails = !this.showDetails;
        break;
      case "reviewSpecialist":
        this.review = this.appointmentSelected.specialistReview;
        this.showReviewSpecialist = !this.showReviewSpecialist;
        break;
      case "reviewPatient":
        this.review = this.appointmentSelected.patientReview;
        this.showReviewPatient = !this.showReviewPatient;
        break;
    }
  }

    async changeStateAppointment()
  {
    
    this.firebaseService.updateDocument('appointments', this.appointmentSelected.id, 
      {
        state: this.stateAppointmentSelected,
        patientReview:+this.review
      }
    )
     this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'patient.uid', value: this.userLogged.uid }],
      'appointments' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
    this.review = "";
  }

  sendReview()
  {
    
    if(this.review != "" && this.review.length > 10)
    {
      this.changeStateAppointment();
    }
  }

}
