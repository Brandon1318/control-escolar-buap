import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { GraficasScreenComponent } from './screens/graficas-screen/graficas-screen.component';
import { RegistroMateriasScreenComponent } from './partials/registro-materias-screen/registro-materias-screen.component';
import { MateriasScreenComponent } from './screens/materias-screen/materias-screen.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginScreenComponent },
      { path: 'registro-usuarios', component: RegistroUsuariosScreenComponent },
      { path: 'registro-usuarios/:rol', component: RegistroUsuariosScreenComponent },
      { path: 'registro-usuarios/:rol/:id', component: RegistroUsuariosScreenComponent },
      { path: 'registro-materias-screen', component: RegistroMateriasScreenComponent },
      { path: 'registro-materias-screen/:id', component: RegistroMateriasScreenComponent },
    ]
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {path: 'home', component: HomeScreenComponent },
      {path: 'administrador', component: AdminScreenComponent },
      {path: 'alumnos', component: AlumnosScreenComponent },
      {path: 'maestros', component: MaestrosScreenComponent },
      {path: 'materias-screen', component: MateriasScreenComponent },
      {path: 'graficas', component: GraficasScreenComponent},
    ]
  },

  // fallback route
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
