import { Routes } from '@angular/router';
import { LoginComponent } from './routes/login/login.component';
import { RegisterUserComponent } from './routes/register-user/register-user.component';
import { CaseListComponent } from './routes/case-list/case-list.component';
import { AuthenticationGuard } from './guards/authentication-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // { path: 'register', component: RegisterUserComponent },
    { path: 'cases',
        canActivate: [AuthenticationGuard],
        component: CaseListComponent },
    { path: '', redirectTo: 'cases', pathMatch: 'full' }

];
