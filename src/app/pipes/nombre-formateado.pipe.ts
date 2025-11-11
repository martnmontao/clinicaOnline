import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreFormateado'
})
export class NombreFormateadoPipe implements PipeTransform {

  transform(value: any): string {
    if (!value) return '';
    const nombre = value.nameUser || '';
    const apellido = value.lastnameUser || '';
    return `${nombre} ${apellido}`.trim();
  }

}
