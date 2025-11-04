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

  // Variables para notificación
  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    // Formulario de creación
    this.crearForm = this.fb.group({
      nombre: ['', Validators.required],
      app: ['', Validators.required],
      apm: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['user', [Validators.required, Validators.pattern(/^(admin|user)$/)]],
      password: ['', Validators.required],
      estado: ['activo', Validators.required]
    });

    // Formulario de edición
    this.editarForm = this.fb.group({
      id: ['', Validators.required],
      nombre: ['', Validators.required],
      app: ['', Validators.required],
      apm: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['user', [Validators.required, Validators.pattern(/^(admin|user)$/)]],
      estado: ['activo', Validators.required]
    });

    this.listarUsuarios();
  }

  notificacionVisible = false;
notificacionMensaje = '';
notificacionTipo: 'success' | 'error' = 'success';

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
          this.mostrarNotificacion(res.error?.mensaje || 'Error al listar usuarios', 'error');
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
          // Manejo completo de errores del backend
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

        // Usuario creado correctamente
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
    const formValue = {
      id: usuario.id,
      nombre: usuario.nombre,
      app: usuario.app,
      apm: usuario.apm,
      email: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      estado: usuario.estado
    };
    this.editarForm.patchValue(formValue);
  }

  // Guardar cambios de usuario
  guardarCambios() {
    if (this.editarForm.invalid) return;

    const updatedUser = { ...this.editarForm.value };
    updatedUser.correo = updatedUser.email;

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
    this.usuarioService.eliminarUsuario({ id: usuario.id }).subscribe({
      next: () => {
        this.listarUsuarios();
        this.mostrarNotificacion('Usuario eliminado', 'success');
      },
      error: () => this.mostrarNotificacion('Error al eliminar usuario', 'error')
    });
  }

  // Cerrar modal
  cerrarModal() {
    this.usuarioEnEdicion = null;
  }
}
