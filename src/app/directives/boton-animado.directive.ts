import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appBotonAnimado]'
})
export class BotonAnimadoDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousedown') presionar() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(0.95)');
  }

  @HostListener('mouseup') soltar() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }
}