import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core'
import { FirebaseService } from '../services/firebase.service';
@Directive({
  selector: '[appPermisosUsuario]'
})
export class PermisosUsuarioDirective {

 @Input('appPermisosUsuario') requiredRole!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
 
    const user: any = await this.firebaseService.getUserLogged();


    this.viewContainer.clear();


    if (user && user.profile === this.requiredRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

}
