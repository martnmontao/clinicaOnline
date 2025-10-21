import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule,FormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {
  specialitiesList: string[] = [
    'Clínica médica',
    'Cardiología',
    'Cirugía General',
    'Ginecología',
    'Pediatría',
    'Dermatología',
    'Neurología',
    'Traumatología',
    'Otorrinolaringología',
    'Hemoterapia'
  ];
  specialitySelected = "";
  specialistSelected: any;
  specialistsList:any[] =[]
  isLoading = false;
  showAppointment = false;
  selectedSpecialityType: 'speciality' | 'secondSpeciality' = 'speciality';
  daysAvailable: string[] = [];
  hoursAvailable: string[] = [];
  selectedDay: string = '';
  selectedHour: string = '';
  user: any;
  constructor(private firebaseService: FirebaseService)
  {
    
  }
  
  async ngOnInit() {
    this.user = await this.firebaseService.getUserLogged();
  }
  
  async filterSpecialist() 
  {
    this.isLoading = true;

    if (this.specialitySelected) {
      this.specialistsList = await this.firebaseService.getUsersWithFilters(
        [
          { key: 'speciality', value: this.specialitySelected },
          { key: 'autorization', value: true }
        ],
        'users'
      );
    } else {
      this.specialistsList = [];
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  selectDay(day: string) {
  this.selectedDay = day;
  this.selectedHour = '';
  this.loadAvailableHoursForDay();
}

 generateNext15Days() {
  const today = new Date();
  this.daysAvailable = [];

  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const day = date.getDate().toString().padStart(2, '0');     
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    this.daysAvailable.push(formattedDate);
  }
}

generateHourSlots(start: string, end: string) {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  this.hoursAvailable = [];

  for (let h = startH; h <= endH; h++) {
    const hourStr = h.toString().padStart(2, '0') + ':00';
    if (h < endH || endM === 0) {
      this.hoursAvailable.push(hourStr);
    }
  }
}
async loadAvailableHoursForDay() {
  if (!this.selectedDay || !this.specialistSelected) return;

  
  const takenAppointments = await this.firebaseService.getDocumentsWithFilters(
    [
      { key: 'specialist.uid', value: this.specialistSelected.uid },
      { key: 'date', value: this.selectedDay }
    ],
    'appointment'
  );


  const takenHours = takenAppointments.map(a => a.hour);

  let specialitySelected;
  if(this.selectedSpecialityType == 'secondSpeciality')
  {
    this.generateHourSlots(this.specialistSelected.startHourSecondSpeciality, this.specialistSelected.endHourSecondSpeciality);
  }
  else
  {
    this.generateHourSlots(this.specialistSelected.startHour, this.specialistSelected.endHour);
  }

  this.hoursAvailable = this.hoursAvailable.filter(hour => !takenHours.includes(hour));
}

showContainer(container: string, specialist?:any)
{
  switch(container)
  {
    case "solicitud":
      case 'solicitud':
      this.specialistSelected = specialist;
      this.generateNext15Days();
      this.selectedDay = '';
      this.selectedHour = '';
      this.onSelectSpecialityType('speciality');
      this.showAppointment = !this.showAppointment; 
      break;
    
  }
}

onSelectSpecialityType(type: 'speciality' | 'secondSpeciality') {
   this.selectedSpecialityType = type;
  this.selectedDay = '';
  this.selectedHour = '';

  if (type === 'speciality') {
    this.generateHourSlots(
      this.specialistSelected.startHour,
      this.specialistSelected.endHour
    );
  } else {
    this.generateHourSlots(
      this.specialistSelected.startHourSecondSpeciality,
      this.specialistSelected.endHourSecondSpeciality
    );
  }
}

async bookAppointment()
{
  
  let specialitySelected;
  if(this.selectedSpecialityType == 'secondSpeciality')
  {
    specialitySelected = this.specialistSelected.secondSpeciality;
  }
  else
  {
    specialitySelected = this.specialistSelected.speciality;

  }


  const turno = {
    specialist: this.specialistSelected,
    specialityType: specialitySelected,
    date: this.selectedDay,
    hour: this.selectedHour,
    state: 'Pendiente',
    patient: this.user,
    patientReview: "",
    specialistReview: ""
  };

  this.firebaseService.addDocument(turno, "appointment");

  this.showAppointment = false;
  this.selectedDay = '';
  this.selectedHour = '';



}

}
