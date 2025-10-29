import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecuperarService {
 private apiUrl = 'http://localhost:3001/api/recuperar';

  constructor() { }
}
