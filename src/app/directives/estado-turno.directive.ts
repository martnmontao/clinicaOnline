import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appEstadoTurno]',
  standalone: true
})
export class EstadoTurnoDirective {

 @Input('appEstadoTurno') estado!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (!this.estado) return;

    let colorFondo = '';
    let colorTexto = 'black';

    switch (this.estado.toLowerCase()) {
      case 'realizado':
        colorFondo = '#c8e6c9'; 
        break;
      case 'pendiente':
        colorFondo = '#fff9c4'; 
        break;
      case 'cancelado':
        colorFondo = '#ffcdd2'; 
        break;
      case 'rechazado':
        colorFondo = '#eeeeee'; 
        break;
      case 'aceptado':
         colorFondo = '#bbdefb';
         break;
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', colorFondo);
    this.renderer.setStyle(this.el.nativeElement, 'color', colorTexto);
  }

}
