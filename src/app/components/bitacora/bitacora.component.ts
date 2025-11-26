import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BitacoraService, Movimiento } from '../../services/bitacora.service';

import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.css',
})
export class BitacoraComponent {
  movimientos: Movimiento[] = [];
  listaProductos: any[] = [];

  crearForm!: FormGroup;
  editarForm!: FormGroup;

  crearCollapsed = true;
  movimientoEnEdicion: Movimiento | null = null;
  movimientoAEliminar: Movimiento | null = null;

  // Propiedades para notificaciones
  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success';

  constructor(
    private readonly bitacoraService: BitacoraService,
    private readonly productosService: ProductosService,
    private readonly fb: FormBuilder
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.listarTodos();
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.listarProductos().subscribe({
      next: (res: any) => {
        // Usamos la misma lógica que tenías en ProductosComponent
        // para asegurar compatibilidad con la respuesta del API
        this.listaProductos = res.lista || res.productos || [];
      },
      error: (err) => {
        console.error('Error al cargar productos para el selector', err);
      },
    });
  }

  inicializarFormularios(): void {
    // Formulario de creación
    this.crearForm = this.fb.group({
      id_producto: ['', [Validators.required]],
      tipo_movimiento: ['entrada', [Validators.required]],
      cantidad: [
        1,
        [Validators.required, Validators.min(1), Validators.max(1000000)],
      ],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
    });

    // Formulario de edición
    this.editarForm = this.fb.group({
      tipo_movimiento: ['', [Validators.required]],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  validarInputCantidad(tipo: 'crear' | 'editar', event: any) {
    const input = event.target as HTMLInputElement;

    // Si la longitud supera los 6 caracteres (ej: 1234567)
    if (input.value.length > 6) {
      // 1. Cortamos el texto y dejamos solo los primeros 6 números
      input.value = input.value.slice(0, 6);

      // 2. Actualizamos el valor en el formulario de Angular
      const valorCorregido = parseFloat(input.value);

      if (tipo === 'crear') {
        this.crearForm.get('cantidad')?.setValue(valorCorregido);
      } else {
        this.editarForm.get('cantidad')?.setValue(valorCorregido);
      }
    }
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
    this.movimientoAEliminar = movimiento;
  }

  // AGREGAR: Este método realiza la eliminación real
  confirmarEliminacion(): void {
    if (!this.movimientoAEliminar) return;

    const id = this.movimientoAEliminar.id!;

    this.bitacoraService.eliminarMovimiento(id).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.mostrarNotificacion(
            res.mensaje || 'Movimiento eliminado exitosamente',
            'success'
          );
          this.listarTodos();
          this.cerrarModalEliminar(); // Cerramos el modal
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

  // AGREGAR: Método para cerrar/cancelar
  cerrarModalEliminar(): void {
    this.movimientoAEliminar = null;
  }
  // Cerrar modal de edición
  cerrarModal(): void {
    this.movimientoEnEdicion = null;
    this.editarForm.reset();
  }
}
