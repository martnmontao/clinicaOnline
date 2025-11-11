import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordenarPorFecha',
  pure: true
})
export class OrdenarPorFechaPipe implements PipeTransform {

  transform(items: any[], campo: string, ascendente: boolean = true): any[] {
    if (!items || !campo) return items;

    return items.sort((a, b) => {
      const fechaA = this.parseFecha(a[campo]);
      const fechaB = this.parseFecha(b[campo]);

      if (!fechaA || !fechaB) return 0;

      return ascendente
        ? fechaA.getTime() - fechaB.getTime()
        : fechaB.getTime() - fechaA.getTime();
    });
  }

  private parseFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;

    if (fechaStr.includes('/')) {
      const [dia, mes, anio] = fechaStr.split('/').map(Number);
      return new Date(anio, mes - 1, dia);
    }

    const fecha = new Date(fechaStr);
    return isNaN(fecha.getTime()) ? null : fecha;
  }
}
