import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Speciality } from '../../interfaces/speciality';
import Swal from 'sweetalert2';
import { RecaptchaModule } from 'ng-recaptcha';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showOptions = false; 
  showSpecialities = false;
  showCaptcha = false;
  showPhotos = false;
  optionsLogins = "PACIENTE";
  labelInput = "Obra social";
   registerForm!: FormGroup;
  images: File[] = [];
  imagesPreview: string[] = [];
  captchaValido = false;
  captchaToken: string | null = null;
  num1: number = 0;
  num2: number = 0;
  respuesta: string = '';
  mensaje: string = '';
  colorMensaje: string = '';
  nameUser: string = "";
  lastNameUser: string = "";
  ageUser: string = "";
  emailUser: string = "";
  passwordUser: string = "";
  socialWorkUser: string = "";
  documentUser: string = "";
  selectSpeciality: string = "";
  specialities: Speciality[] = [];
  specilityAdded: string = "";
  

  constructor(private router: Router,  private fb: FormBuilder,private firebaseService: FirebaseService)
  {
    
  }
  get f(): { [key: string]: AbstractControl } {
  return this.registerForm.controls;
}

   ngOnInit(): void {
    this.registerForm = this.fb.group({
      nameUser: ['', Validators.required],
      lastNameUser: ['', Validators.required],
      ageUser: [
        '', 
        [
          Validators.required,
          Validators.min(18),
          Validators.max(99),
          Validators.pattern(/^[0-9]+$/)
        ]
      ],
      documentUser: [
      '', 
      [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/)
      ]
      ],
      emailUser: ['', [Validators.required, Validators.email]],
      passwordUser: ['', [Validators.required, Validators.minLength(6)]],
      socialWorkUser: [''],
      selectSpeciality: [''],
      specilityAdded: ['']
    });
  }


 goTo(route: string) {
  this.router.navigate([route]);
}



onCaptchaResolved(event: any): void {
  const token = event ? String(event) : null;

  if (token) {
    this.captchaValido = true;
    this.captchaToken = token;
    console.log('✅ Captcha resuelto:', token);
  } else {
    this.captchaValido = false;
  }
}
  onSubmitCaptcha(): void {
  if (!this.captchaValido || !this.captchaToken) {
    Swal.fire('Debes completar el captcha antes de continuar.');
    return;
  }


  this.showCaptcha = false;
  this.registerUser();
}

checkFormAndShowCaptcha() {
  this.registerForm.markAllAsTouched();

  const errores: string[] = [];
  const controls = this.registerForm.controls;


  if (controls['nameUser'].hasError('required')) errores.push('El nombre es obligatorio.');
  if (controls['lastNameUser'].hasError('required')) errores.push('El apellido es obligatorio.');


  const edad = Number(controls['ageUser'].value);
  if (controls['ageUser'].hasError('required')) {
    errores.push('La edad es obligatoria.');
  } else if (isNaN(edad)) {
    errores.push('La edad debe ser un número válido.');
  } else if (edad < 18) {
    errores.push('Debes tener al menos 18 años.');
  } else if (edad > 99) {
    errores.push('La edad no puede ser mayor de 99 años.');
  }


  if (controls['documentUser'].hasError('required')) {
    errores.push('El número de documento es obligatorio.');
  } else if (controls['documentUser'].hasError('pattern')) {
    errores.push('El número de documento debe tener exactamente 8 dígitos numéricos.');
  }

  if (controls['emailUser'].hasError('required')) {
    errores.push('El correo electrónico es obligatorio.');
  } else if (controls['emailUser'].hasError('email')) {
    errores.push('El correo electrónico no es válido.');
  }


  if (controls['passwordUser'].hasError('required')) {
    errores.push('La contraseña es obligatoria.');
  } else if (controls['passwordUser'].hasError('minlength')) {
    errores.push('La contraseña debe tener al menos 6 caracteres.');
  }


  if (this.showSpecialities) {
  const selectValue = this.registerForm.get('selectSpeciality')?.value;
  const inputValue = this.registerForm.get('specilityAdded')?.value;
  const arrayHasSpecialities = this.specialities.length > 0;

  if (!selectValue && !inputValue && !arrayHasSpecialities) {
    errores.push('Debes seleccionar o agregar al menos una especialidad.');
  }
}


  if (!this.imagesPreview || this.imagesPreview.length !== 2) {
    errores.push('Debes subir exactamente 2 imágenes de perfil.');
  }


  if (errores.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Por favor corrige los siguientes errores',
      html: errores.join('<br>'),
      confirmButtonText: 'Aceptar'
    });
    return;
  }


  this.showCaptcha = true;
}

    async submitCaptchaAndRegister() {
    if (!this.captchaValido) {
      Swal.fire({
      icon: 'error',
      title: 'Captcha inválido',
      text: 'Debes completar el captcha antes de continuar.',
      confirmButtonText: 'Aceptar'
    });
      return;
    }

    await this.registerUser();
  }

  
  showContainer(container: string)
  {
    switch(container)
    {
      case "captcha":
        this.showCaptcha = !this.showCaptcha;
        break
    }
  }

   toggleOptions() 
  {
    this.showOptions = !this.showOptions;
    
  }

  

  openInput() 
  {
    const input = document.getElementById('input-file') as HTMLInputElement;
    input.click();
   
  }

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const archivos = Array.from(input.files);

    archivos.forEach((archivo) => {
      this.images.push(archivo);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          
          const maxWidth = 400; 
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);


          this.imagesPreview.push(compressedBase64);
        };
      };
      reader.readAsDataURL(archivo);
    });
  }
}

  async registerUser() {
    const { nameUser, lastNameUser, ageUser, documentUser, emailUser, passwordUser, socialWorkUser, selectSpeciality, specilityAdded } = this.registerForm.value;
    const specialityImage = "";
    try {
      const userCredential = await this.firebaseService.signUp(emailUser, passwordUser);
      const user = userCredential.user;
      if (!user) return;

      const emailSent = await this.firebaseService.verifyEmailUser(user);
      if (!emailSent) return;

      let data: any;

      if (this.optionsLogins === 'PACIENTE') {
        data = {
          uid: user.uid,
          nameUser,
          lastnameUser: lastNameUser,
          ageUser,
          documentUser,
          socialWorkUser,
          imagesUser: this.imagesPreview,
          profile: 'Paciente',
          emailUser,
          imageSelected: this.imagesPreview[0] || ''
        };
      } else {
        if (selectSpeciality) this.specialities.push({ name: selectSpeciality, startHourWork: '08:00', endHourWork: '19:00', startHourWeekend: '08:00', endHourWeekend: '14:00', specialityImage });
        if (specilityAdded) this.specialities.push({ name: specilityAdded, startHourWork: '08:00', endHourWork: '19:00', startHourWeekend: '08:00', endHourWeekend: '14:00', specialityImage });

        data = {
          uid: user.uid,
          nameUser,
          lastnameUser: lastNameUser,
          ageUser,
          documentUser,
          imagesUser: this.imagesPreview,
          specialities: this.specialities,
          profile: 'Especialista',
          autorization: false,
          emailUser,
          imageSelected: this.imagesPreview[0] || ''
        };
      }

      await this.firebaseService.addDocument(data, 'users');
       Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'El registro fue exitoso porfavor verifique su email.',
      confirmButtonText: 'Aceptar'
    });
      this.registerForm.reset();
      this.imagesPreview = [];
      this.specialities = [];
      this.showCaptcha = false;
      this.router.navigateByUrl('login');

    } catch (err: unknown) {
     

        let mensaje = 'Ocurrió un error al registrar el usuario.';
        const error = err as { code?: string; message?: string };

        switch (error.code) {
          case 'auth/email-already-in-use':
            mensaje = 'El correo electrónico ya está registrado.';
            break;
          case 'auth/invalid-email':
            mensaje = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            mensaje = 'La contraseña debe tener al menos 6 caracteres.';
            break;
          case 'auth/missing-password':
            mensaje = 'Debes ingresar una contraseña.';
            break;
          case 'auth/network-request-failed':
            mensaje = 'Error de conexión. Verifica tu red e inténtalo nuevamente.';
            break;
          case 'auth/too-many-requests':
            mensaje = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
            break;
          default:
            mensaje = error.message || mensaje;
            break;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar usuario',
          text: mensaje,
        confirmButtonText: 'Aceptar'
        });
        }
  }

  addSpeciality() {
    if (this.f['specilityAdded'].value) {
      const newSpeciality: Speciality = {
        name: this.f['specilityAdded'].value,
        startHourWork: "08:00",
        endHourWork: "19:00",
        startHourWeekend: "08:00",
        endHourWeekend: "14:00",
        specialityImage: ""
      };
      this.specialities.push(newSpeciality);
      this.f['specilityAdded'].setValue('');
    }
  }




  }




