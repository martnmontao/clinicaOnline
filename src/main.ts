import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
