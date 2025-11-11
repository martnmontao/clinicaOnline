import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarTurnos',
  pure: false
})
export class FiltrarTurnosPipe implements PipeTransform {

   transform(appointments: any[], filterValue: string): any[] {
    if (!appointments) return [];
    if (!filterValue) return appointments;

    const value = filterValue.toLowerCase().trim();

    return appointments.filter((a: any) => {
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

}
