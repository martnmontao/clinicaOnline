import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { AvailableDay } from '../../../interfaces/availableDay';
import Swal from 'sweetalert2';
import { NombreFormateadoPipe } from '../../../pipes/nombre-formateado.pipe';

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule,FormsModule, NombreFormateadoPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {
  specialitiesList: string[] = [];
  specialitySelected: any;
  specialistSelected: any;
  specialistsList:any[] =[]
  isLoading: boolean = false;
  showAppointment: boolean = false;
  showSpecialities: boolean = false;
  patientSelected: any;
  hoursAvailable: string[] = [];
  selectedDay: AvailableDay | null = null;
  daysAvailable: AvailableDay[] = [];
  selectedHour: string = '';
  user: any;
  usersList: any;
  showSpecialists: boolean = false;
  filterValue: string = "";

  constructor(private firebaseService: FirebaseService)
  {
    
  }
  
  async ngOnInit() {
    this.isLoading = true;
    this.user = await this.firebaseService.getUserLogged();
 

    this.firebaseService.getSpecifyUsers("profile", "Paciente", "users").then(answer => 
      {
        this.usersList = answer;
      }
    )
    
    this.filterSpecialist();
    this.specialistsList = await this.firebaseService.getSpecifyUsers("profile", "Especialista", "users")
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

  }

  async showAllSpecilists()
  {
    this.filterSpecialist();

  }
  
async filterSpecialist() {
  this.isLoading = true;

  const allSpecialists = await this.firebaseService.getSpecifyUsers(
    'autorization',
    true,
    'users'
  );

  if (this.specialitySelected != "") {

    this.specialistsList = allSpecialists
      .filter(specialist =>
        specialist.specialities?.some((s: { name: string }) => s.name === this.specialitySelected)
      )
      .map(specialist => {
        const spec = specialist.specialities.find(
          (s: any) => s.name === this.specialitySelected.name
        );

        return {
          ...specialist,
          specialityName: spec?.name,
          startHour: spec?.startHourWork,
          endHour: spec?.endHourWork,
          startHourWeekend: spec?.startHourWeekend,
          endHourWeekend: spec?.endHourWeekend
        };
      });
  } else {

    this.specialistsList = allSpecialists.flatMap(specialist => {
      return (specialist.specialities || []).map((spec: any) => ({
        ...specialist,
        specialityName: spec?.name,
        startHour: spec?.startHourWork,
        endHour: spec?.endHourWork,
        startHourWeekend: spec?.startHourWeekend,
        endHourWeekend: spec?.endHourWeekend
      }));
    });
  }

  console.log(this.specialistsList);
  this.isLoading = false;
}

  
  getSpecialityName(specialist: any): string {
    if (!this.specialitySelected) return '';
    const found = specialist.specialities.find((s: { name: string }) => s.name === this.specialitySelected);
    return found ? found.name : '';
  }

showContainer(container: string, specialist?: any, specialityName?: string) {
  switch (container) {
    case 'solicitud':
      this.specialistSelected = specialist;
      this.specialitySelected = this.specialitySelected || specialityName || '';
      this.generateNext15Days();
      this.selectedDay = null;
      this.selectedHour = '';
      //this.showAppointment = true;
      break;
  }
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
    const dayOfWeek = date.getDay(); 
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    this.daysAvailable.push({
      date: formattedDate,
      isWeekend,
      dayOfWeek,
      jsDate: date
    });
  }
}

    selectDay(day: AvailableDay) {
    this.selectedDay = day;
    this.selectedHour = '';
    this.loadAvailableHours();
    console.log(this.selectedDay)
  }


async loadAvailableHours() {
  if (!this.specialistSelected || !this.selectedDay || !this.specialitySelected) return;

  const isWeekend = this.selectedDay.isWeekend;

  
  const specialityObj = this.specialistSelected.specialities.find(
    (s: any) => s.name === this.specialitySelected.name
  );

  if (!specialityObj) return;

  
  const startHour = isWeekend ? specialityObj.startHourWeekend : specialityObj.startHourWork;
  const endHour = isWeekend ? specialityObj.endHourWeekend : specialityObj.endHourWork;

 
  const takenAppointments = await this.firebaseService.getDocumentsWithFilters(
    [
      { key: 'specialist.uid', value: this.specialistSelected.uid },
      { key: 'date', value: this.selectedDay.date } 
    ],
    'appointments'
  );

  const takenHours = takenAppointments.map((a: any) => a.hour);


  const allSlots = this.generateHourSlots(startHour, endHour);


  this.hoursAvailable = allSlots.filter(hour => !takenHours.includes(hour));
}


  generateHourSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const current = new Date();
    current.setHours(startH, startM, 0, 0);
    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (current < endTime) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current.setMinutes(current.getMinutes() + 30); 
    }

    return slots;
  }


  async bookAppointment()
  {

    try
    {

      let data;
      if(this.user.profile == 'Paciente')

      {
        data= {
          patient: this.user,
          date: this.selectedDay?.date,
          hour: this.selectedHour,
          specialist: this.specialistSelected,
          speciality: this.specialitySelected.name,
          state: "Pendiente",
          specialistReview: "",
          patientReview: ""
        }
      }
      else
      {
        data= {
        patient: this.patientSelected,
        date: this.selectedDay?.date,
        hour: this.selectedHour,
        specialist: this.specialistSelected,
        speciality: this.specialitySelected.name,
        state: "Pendiente",
        specialistReview: "",
        patientReview: ""
        }
      }
      console.log(data)
      this.firebaseService.addDocument(data, "appointments");
      await Swal.fire({
          icon: 'success',
          title: '¡Turno solicitado!',
          text: 'Se ha procesado la solicitud exitosamente.',
          timer: 2000,
          showConfirmButton: false,
          scrollbarPadding: false,
          confirmButtonText: 'Aceptar', 
          backdrop: false,
          customClass: {
            container: 'swal2-container-absolute',
            popup: 'my-swal-popup'
          }
        });

    }catch(e)
    {
      console.log("No se ha guardado en firebase")
      this.showAppointment = false;
      await Swal.fire({
          icon: 'error',
          title: 'Ha sucedido un error',
          text: 'No se ha podido solicitar el turno. Intente denuevo más tarde.',
          timer: 2000,
          showConfirmButton: false,
          scrollbarPadding: false,
          confirmButtonText: 'Aceptar', 
          backdrop: false,
          customClass: {
            container: 'swal2-container-absolute',
            popup: 'my-swal-popup'
          }
        });
    }
    finally
    {
      this.showAppointment = false;
      
    }

  }



}
