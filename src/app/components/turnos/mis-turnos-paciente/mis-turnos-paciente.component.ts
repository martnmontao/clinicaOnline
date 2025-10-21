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
  appointmentsFiltered: any = [];
  showFilters: boolean = false;
  filterSpecialistSelected:any;
  filterSpecialitySelected:any;
  appointmentSelected: any;
  showDetails: boolean = false;
  stateAppointmentSelected: string = "";
  showReviewSpecialist: boolean = false;
  showReviewPatient: boolean = false;

  review:string = "";

  constructor(private firebaseService: FirebaseService)
  {
    
  }

  async ngOnInit(){
    this.userLogged = await this.firebaseService.getUserLogged();
    this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'patient.uid', value: this.userLogged.uid }],
      'appointment' 
    );
    this.appointmentsFiltered = this.patientsAppointment;
     this.specialityFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.specialityType))
    ];

    this.specialistsFilters = [
    ...new Set(this.patientsAppointment.map((t: any) => t.specialist.nameUser))
    ];

    
  }


  async filterSpecialities(speciality: string) 
  {

     const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.specialityType === speciality);
    
    this.appointmentsFiltered = filteredAppointments;

  }


  async filterSpecialist(specialist: string)
  {
    
   
    const filteredAppointments = this.patientsAppointment.filter(
    (appointment: any) => appointment.specialist.nameUser === specialist);
    
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
    
    this.firebaseService.updateDocument('appointment', this.appointmentSelected.id, 
      {
        state: this.stateAppointmentSelected,
        patientReview: this.review
      }
    )
     this.patientsAppointment = await this.firebaseService.getDocumentsWithFilters(
    [{ key: 'patient.uid', value: this.userLogged.uid }],
      'appointment' 
    );


    this.appointmentsFiltered = this.patientsAppointment;
    this.review = "";
  }

  sendReview()
  {
    
    if(this.review != "" && this.review.length > 20)
    {
      this.changeStateAppointment();
    }
  }

}
