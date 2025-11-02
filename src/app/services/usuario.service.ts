import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
 private apiUrl = 'http://localhost:3001/api/usuarios';


  constructor() { }
}
