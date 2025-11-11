import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarPacientes',
  pure: true 
})
export class FiltrarPacientesPipe implements PipeTransform {

 transform(appointments: any[], filtro: string): any[] {
    if (!appointments) return [];
    if (!filtro) return appointments;

    const value = filtro.toLowerCase().trim();

    return appointments.filter((a: any) => {
      const patientName = a.patient?.nameUser?.toLowerCase() || '';
      const patientLastname = a.patient?.lastnameUser?.toLowerCase() || '';
      const speciality = a.speciality?.toLowerCase() || '';
      const day = a.date?.toLowerCase() || '';
      const time = a.hour?.toLowerCase() || '';
      const status = a.state?.toLowerCase() || '';

      return (
        patientLastname.includes(value) ||
        patientName.includes(value) ||
        speciality.includes(value) ||
        day.includes(value) ||
        time.includes(value) ||
        status.includes(value)
      );
    });
  }

}
