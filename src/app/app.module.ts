import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch,HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from './components/admin/admin.component';
import { PersonalComponent } from './components/personal/personal.component';
import { AuthInterceptor } from './services/interceptor.service';
import { BarraComponent } from './components/barra/barra.component';
import { ReportesComponent } from './components/reportes - dashboard/reportes.component';
import { ProductosComponent } from './components/productos/productos.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificacionComponent } from './components/notificacion/notificacion.component';
import { TiempoInterceptor } from './interceptor/tiempo.interceptor';
import { RecuperarComponent } from './components/recuperar/recuperar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AdminComponent,
    PersonalComponent,
    BarraComponent,
    ReportesComponent,
    ProductosComponent,
    UsuariosComponent,
    NotificacionComponent,
    RecuperarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    BrowserAnimationsModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TiempoInterceptor, multi: true },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
