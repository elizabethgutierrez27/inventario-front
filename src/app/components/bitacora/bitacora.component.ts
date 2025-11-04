import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BitacoraService, Movimiento } from '../../services/bitacora.service';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.css',
})
export class BitacoraComponent {
  movimientos: Movimiento[] = [];

  crearForm!: FormGroup;
  editarForm!: FormGroup;

  crearCollapsed = true;
  movimientoEnEdicion: Movimiento | null = null;

  // Propiedades para notificaciones
  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success';

  constructor(
    private readonly bitacoraService: BitacoraService,
    private readonly fb: FormBuilder
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.listarTodos();
  }

  inicializarFormularios(): void {
    // Formulario de creación
    this.crearForm = this.fb.group({
      id_producto: ['', [Validators.required, Validators.minLength(3)]],
      tipo_movimiento: ['entrada', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });

    // Formulario de edición
    this.editarForm = this.fb.group({
      tipo_movimiento: ['', [Validators.required]],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  // Método para mostrar notificaciones
  mostrarNotificacion(
    mensaje: string,
    tipo: 'success' | 'error' = 'success'
  ): void {
    this.notifMensaje = mensaje;
    this.notifTipo = tipo;
    this.notifVisible = true;

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
      this.notifVisible = false;
    }, 5000);
  }

  // Método mejorado para extraer el mensaje de error
  private extraerMensajeError(res: any): string {
    if (res?.error) {
      const mensajes: string[] = [];

      // Si hay lista de errores de validación
      if (Array.isArray(res.error.detalle)) {
        const detalleMensajes = res.error.detalle.map(
          (e: any) => `${e.campo}: ${e.mensaje}`
        );
        mensajes.push(...detalleMensajes);
      }

      // Solo agregar mensaje general si NO hay detalles
      // (evita duplicados como "Errores de validación")
      if (res.error.mensaje && mensajes.length === 0) {
        mensajes.push(res.error.mensaje);
      }

      if (mensajes.length > 0) {
        // Usar <br> para saltos de línea en HTML
        return mensajes.join('<br>');
      }
    }

    // En caso de mensaje directo o estructura diferente
    if (res.mensaje) {
      return res.mensaje;
    }

    if (res.error?.mensaje) {
      return res.error.mensaje;
    }

    return 'Error en la operación';
  }

  // Listar todos los movimientos
  listarTodos(): void {
    this.bitacoraService.listarMovimientos().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.movimientos = res;
        } else if (res.data && Array.isArray(res.data)) {
          this.movimientos = res.data;
        } else if (res.movimientos && Array.isArray(res.movimientos)) {
          this.movimientos = res.movimientos;
        } else {
          this.movimientos = [];
          console.warn('Formato de respuesta inesperado:', res);
        }

        console.log('Movimientos cargados:', this.movimientos);
      },
      error: (err) => {
        console.error('Error al cargar movimientos:', err);
        this.mostrarNotificacion(
          'Error de conexión al cargar la bitácora',
          'error'
        );
      },
    });
  }

  // Crear nuevo movimiento
  crear(): void {
    if (
      !this.crearForm.get('id_producto')?.value ||
      !this.crearForm.get('tipo_movimiento')?.value
    ) {
      this.mostrarNotificacion(
        'Por favor complete todos los campos obligatorios',
        'error'
      );
      return;
    }

    const movimiento: Movimiento = this.crearForm.value;

    this.bitacoraService.crearMovimiento(movimiento).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          // ✅ Éxito
          this.mostrarNotificacion(
            res.mensaje || 'Movimiento registrado exitosamente',
            'success'
          );
          this.listarTodos();
          this.crearForm.reset({
            tipo_movimiento: 'entrada',
            cantidad: 1,
            descripcion: '',
          });
          this.crearCollapsed = true;
        } else {
          // ❌ Error de validación, duplicado, etc.
          const mensajeError = this.extraerMensajeError(res);
          this.mostrarNotificacion(mensajeError, 'error');
        }
      },
      error: (err) => {
        // 🔥 Solo entra aquí si hay fallo de red o no responde el servidor
        console.error('Error de conexión o backend caído:', err);
        this.mostrarNotificacion('Error de conexión con el servidor', 'error');
      },
    });
  }

  // Editar movimiento
  editar(movimiento: Movimiento): void {
    this.movimientoEnEdicion = { ...movimiento };
    this.editarForm.patchValue({
      tipo_movimiento: movimiento.tipo_movimiento,
      cantidad: movimiento.cantidad,
      descripcion: movimiento.descripcion,
    });
  }

  // Guardar cambios de edición
  guardarCambios(): void {
    if (!this.movimientoEnEdicion) {
      this.mostrarNotificacion(
        'No hay movimiento seleccionado para editar',
        'error'
      );
      return;
    }

    const movimientoActualizado = {
      id: this.movimientoEnEdicion.id!,
      ...this.editarForm.value,
    };

    console.log('📤 Enviando al backend:', movimientoActualizado);

    this.bitacoraService.actualizarMovimiento(movimientoActualizado).subscribe({
      next: (res: any) => {
        console.log('📥 Respuesta del servidor:', res);

        if (res.codigo === 0) {
          this.mostrarNotificacion(
            res.mensaje || 'Movimiento actualizado exitosamente',
            'success'
          );
          this.listarTodos();
          this.cerrarModal();
        } else {
          const mensajeError = this.extraerMensajeError(res);
          this.mostrarNotificacion(mensajeError, 'error');
        }
      },
      error: (err) => {
        console.error('❌ Error al actualizar movimiento:', err);
        this.mostrarNotificacion(
          'Error de conexión al actualizar movimiento',
          'error'
        );
      },
    });
  }

  // Eliminar movimiento
  eliminar(movimiento: Movimiento): void {
    if (
      !confirm(
        `¿Está seguro de eliminar el movimiento del producto "${movimiento.codigo_producto}"?`
      )
    ) {
      return;
    }

    this.bitacoraService.eliminarMovimiento(movimiento.id!).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.mostrarNotificacion(
            res.mensaje || 'Movimiento eliminado exitosamente',
            'success'
          );
          this.listarTodos();
        } else {
          const mensajeError = this.extraerMensajeError(res);
          this.mostrarNotificacion(mensajeError, 'error');
        }
      },
      error: (err) => {
        console.error('Error al eliminar movimiento:', err);
        this.mostrarNotificacion(
          'Error de conexión al eliminar movimiento',
          'error'
        );
      },
    });
  }

  // Cerrar modal de edición
  cerrarModal(): void {
    this.movimientoEnEdicion = null;
    this.editarForm.reset();
  }
}
