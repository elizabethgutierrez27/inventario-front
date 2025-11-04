import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { PersonalComponent } from './components/personal/personal.component';
import path from 'path';
import { BarraComponent } from './components/barra/barra.component';
import { ReportesComponent } from './components/reportes - dashboard/reportes.component';
import { ProductosComponent } from './components/productos/productos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { authGuard } from './guards/auth.guard';
import { RecuperarComponent } from './components/recuperar/recuperar.component';
import { BitacoraComponent } from './components/bitacora/bitacora.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'personal', component: PersonalComponent, canActivate: [authGuard] },
  { path: 'barra', component: BarraComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [authGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'bitacora', component: BitacoraComponent, canActivate: [authGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
