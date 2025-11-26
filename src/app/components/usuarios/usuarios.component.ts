import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  crearCollapsed = true;
  usuarioEnEdicion: any = null;

  crearForm!: FormGroup;
  editarForm!: FormGroup;

  usuarios: any[] = [];

  // Variables correctas para notificación (USAR SOLO ESTAS)
  notificacionVisible = false;
  notificacionMensaje = '';
  notificacionTipo: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    // Formulario de creación
    this.crearForm = this.fb.group({
  correo: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(80),
    Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ]],

  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
  ]],

  nombre: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  app: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  apm: ['', [
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  telefono: ['', [
    Validators.required,
    Validators.maxLength(15),
    Validators.pattern(/^\+52\d{10}$/)
  ]],

  rol: ['user', [
    Validators.required,
    Validators.pattern(/^(admin|user)$/)
  ]],

  estado: ['activo', Validators.required]
});



    // Formulario de edición
    this.editarForm = this.fb.group({
      id: ['', Validators.required],
      correo: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(80),
    Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ]],

  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(100),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
  ]],

  nombre: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  app: ['', [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  apm: ['', [
    Validators.maxLength(50),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/)
  ]],

  telefono: ['', [
    Validators.required,
    Validators.maxLength(15),
    Validators.pattern(/^\+52\d{10}$/)
  ]],

  rol: ['user', [
    Validators.required,
    Validators.pattern(/^(admin|user)$/)
  ]],

  estado: ['activo', Validators.required]
    });

    this.listarUsuarios();
  }

 getError(form: FormGroup, controlName: string): string | null {
  const control = form.get(controlName);

  if (!control || !(control.touched || control.dirty) || !control.errors) {
    return null;
  }

  const errors = control.errors;

  // -------- CAMPOS OBLIGATORIOS --------
  if (errors['required']) {
    switch (controlName) {
      case 'correo': return 'Correo es obligatorio';
      case 'password': return 'Contraseña es obligatoria';
      case 'rol': return 'Rol es obligatorio';
      case 'estado': return 'Estado es obligatorio';
      case 'nombre': return 'Nombre es obligatorio';
      case 'telefono': return 'Teléfono es obligatorio';
      default: return 'Campo obligatorio';
    }
  }

  // -------- EMAIL --------
  if (errors['email']) return 'El correo no es válido';

  // -------- LONGITUD MÁXIMA --------
  if (errors['maxlength']) {
    return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
  }

  // -------- LONGITUD MÍNIMA --------
  if (errors['minlength']) {
    return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
  }

  // -------- VALIDACIONES DE BACKEND (regex específicos) --------

  // Nombre y apellidos solo letras
  if (errors['pattern']) {
    if (controlName === 'nombre') return 'El nombre solo puede contener letras y espacios';
    if (controlName === 'app') return 'El apellido paterno solo puede contener letras y espacios';
    if (controlName === 'apm') return 'El apellido materno solo puede contener letras y espacios';
    if (controlName === 'telefono') return 'El teléfono debe incluir código +52 y 10 dígitos';
    if (controlName === 'password') {
      return 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo';
    }
    return 'Formato no permitido';
  }

  return null;
}




  // Método único para mostrar la notificación
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.notificacionMensaje = mensaje;
    this.notificacionTipo = tipo;
    this.notificacionVisible = true;

    setTimeout(() => this.notificacionVisible = false, 5000);
  }

  // Listar usuarios
  listarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.usuarios = res.usuarios;
        } else {
          this.mostrarNotificacion(
            res.error?.mensaje || 'Error al listar usuarios',
            'error'
          );
        }
      },
      error: () => this.mostrarNotificacion('Error al conectar con el servidor', 'error')
    });
  }

  // Crear usuario
  crear() {
    if (this.crearForm.invalid) return;

    this.usuarioService.crearUsuario(this.crearForm.value).subscribe({
      next: (res: any) => {
        if (res.codigo !== 0) {
          let mensaje = '';

          if (Array.isArray(res.error?.detalle)) {
            mensaje = res.error.detalle.join(', ');
          } else if (res.error?.detalle) {
            mensaje = res.error.detalle;
          } else if (res.error?.mensaje) {
            mensaje = res.error.mensaje;
          } else {
            mensaje = 'Error al crear usuario';
          }

          this.mostrarNotificacion(mensaje, 'error');
          return;
        }

        this.crearForm.reset({ estado: 'activo', rol: 'user' });
        this.listarUsuarios();
        this.mostrarNotificacion('Usuario creado con éxito', 'success');
      },
      error: () => this.mostrarNotificacion('Error al conectar con el servidor', 'error')
    });
  }

  // Abrir modal de edición
  editar(usuario: any) {
    this.usuarioEnEdicion = usuario;

    this.editarForm.patchValue({
      id: usuario.id,
      nombre: usuario.nombre,
      app: usuario.app,
      apm: usuario.apm,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      estado: usuario.estado
    });
  }

  // Guardar cambios de usuario
  guardarCambios() {
    if (this.editarForm.invalid) return;

    const updatedUser = { ...this.editarForm.value };

    this.usuarioService.actualizarUsuario(updatedUser).subscribe({
      next: (res: any) => {
        if (res.codigo !== 0) {
          let mensaje = '';

          if (Array.isArray(res.error?.detalle)) {
            mensaje = res.error.detalle.join(', ');
          } else if (res.error?.detalle) {
            mensaje = res.error.detalle;
          } else if (res.error?.mensaje) {
            mensaje = res.error.mensaje;
          } else {
            mensaje = 'Error al actualizar usuario';
          }

          this.mostrarNotificacion(mensaje, 'error');
          return;
        }

        this.listarUsuarios();
        this.cerrarModal();
        this.mostrarNotificacion('Usuario actualizado con éxito', 'success');
      },
      error: () => this.mostrarNotificacion('Error al conectar con el servidor', 'error')
    });
  }

  // Eliminar usuario
  eliminar(usuario: any) {
    this.usuarioService.eliminarUsuario({ correo: usuario.correo }).subscribe({
      next: () => {
        this.listarUsuarios();
        this.mostrarNotificacion('Usuario eliminado', 'success');
      },
      error: () => this.mostrarNotificacion('Error al eliminar usuario', 'error')
    });
  }

  cerrarModal() {
    this.usuarioEnEdicion = null;
  }
}
