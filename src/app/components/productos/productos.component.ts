import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';
import { debounceTime } from 'rxjs/operators';


interface Producto {
  codigo: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  stock: number;
  precio: number;
  proveedor?: string;
  id_categoria: number;
  imagen?: string;
  categoria_nombre?: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  categorias: Categoria[] = [];

  filtrosForm!: FormGroup;
  crearForm!: FormGroup;
  editarForm!: FormGroup;

  filtrosCollapsed = true;
  crearCollapsed = true;

  productoEnEdicion: Producto | null = null;

  // 🔹 Objetos para guardar errores específicos
  erroresCrear: any = {};
  erroresEditar: any = {};

  // Notificaciones
  notifVisible = false;
  notifMensaje = '';
  notifTipo: 'success' | 'error' = 'success';


  constructor(
    private productoService: ProductosService,
    private categoriaService: CategoriasService,
    private fb: FormBuilder
  ) {
    // Formulario de filtros
    this.filtrosForm = this.fb.group({
      nombre: [''],
      categoria: [''],
      proveedor: ['']
    });

    // Formulario de creación
    // Formulario de creación con VALIDACIONES
    this.crearForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(53)]],
      descripcion: ['', [Validators.maxLength(100)]],
      cantidad: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
      precio: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
      proveedor: ['', [Validators.maxLength(53)]],
      id_categoria: [null, [Validators.required]],
      imagen: ['']
    });

  }

  ngOnInit(): void {
  this.listarTodos();
  this.listarCategorias();

  this.editarForm = this.fb.group({

    codigo: ['', [Validators.required, Validators.maxLength(10)]],
    nombre: ['', [Validators.required, Validators.maxLength(53)]],
    descripcion: ['', [Validators.maxLength(100)]],
    cantidad: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
    precio: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
    proveedor: ['', [Validators.maxLength(53)]],
    id_categoria: [null, [Validators.required]],
    imagen: ['']
  });

  this.filtrosForm.valueChanges
    .pipe(debounceTime(300))
    .subscribe(values => {
      const { nombre, categoria, proveedor } = values;
      if (nombre || categoria || proveedor) {
        this.filtrar();
      } else {
        this.listarTodos();
      }
    });
  }


  // ------------------------------------------------------------------
  // FILTROS
  // ------------------------------------------------------------------
  filtrar() {
    const filtros = this.filtrosForm.value;
    if (!filtros.nombre && !filtros.categoria && !filtros.proveedor) {
      this.mostrarNotificacion('Debe enviar al menos un campo para filtrar', 'error');
      return;
    }

    this.productoService.filtrarProductos(filtros).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.productos = res.productos;
        } else {
          this.mostrarNotificacion(res.mensaje || 'Error al filtrar productos', 'error');
        }
      },
      error: (err) => {
        this.mostrarNotificacion('Error de conexión al filtrar productos', 'error');
}
    });
  }

  obtenerNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.id === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  resetFiltros() {
    this.filtrosForm.reset({ nombre: '', categoria: '', proveedor: '' });
    this.listarTodos();
  }

  // ------------------------------------------------------------------
  // CRUD
  // ------------------------------------------------------------------
  listarTodos() {
    this.productoService.listarProductos().subscribe({
      next: (res: any) => {
        this.productos = res.lista || res.productos || [];
      },
      error: () => {
        this.mostrarNotificacion('Error de conexión al cargar productos', 'error');
      }
    });
  }

  listarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res.lista || res.categorias || [];
        if (this.categorias.length > 0) {
          this.crearForm.patchValue({ id_categoria: this.categorias[0].id });
        }
      },
      error: () => {
        this.mostrarNotificacion('Error al cargar categorías', 'error');
      }
    });
  }

  // ------------------------------------------------------------------
  // CREAR PRODUCTO
  // ------------------------------------------------------------------
  crear() {
    const producto = this.crearForm.value;
    this.erroresCrear = {}; // limpia errores previos

    this.productoService.crearProducto(producto).subscribe({
      next: (res: any) => {
        if (res.codigo === 2) {
          const msg = this.extraerMensajeError(res);
          this.mostrarNotificacion(msg, 'error');
          return;
        }

        if (res.codigo === 0) {
          this.mostrarNotificacion(res.mensaje || 'Producto creado correctamente', 'success');
          this.listarTodos();
          this.crearForm.reset({
            id_categoria: this.categorias[0]?.id,
            cantidad: 0,
            stock: 0,
            precio: 0
          });
        }
      },
      error: () => {
        this.mostrarNotificacion('Error de conexión al crear producto', 'error');
      }

    });
  }

  // ------------------------------------------------------------------
  // EDITAR PRODUCTO
  // ------------------------------------------------------------------
  editar(producto: Producto) {
    this.productoEnEdicion = { ...producto };
    this.erroresEditar = {};
    this.editarForm.patchValue(this.productoEnEdicion);
  }

  guardarCambios() {
    const productoActualizado = this.editarForm.value;
    this.erroresEditar = {};

    this.productoService.actualizarProducto(productoActualizado).subscribe({
      next: (res: any) => {
        if (res.codigo === 2) {
          const msg = this.extraerMensajeError(res);
          this.mostrarNotificacion(msg, 'error');
          return;
        }

        if (res.codigo === 0) {
          this.mostrarNotificacion(res.mensaje || 'Producto actualizado', 'success');
          this.listarTodos();
          this.cerrarModal();
        }
      },
      error: () => {
        this.mostrarNotificacion('Error de conexión al actualizar producto', 'error');
      }

    });
  }

  // ------------------------------------------------------------------
  // ELIMINAR PRODUCTO
  // ------------------------------------------------------------------
  eliminar(producto: Producto) {
    if (!confirm(`¿Deseas eliminar el producto "${producto.nombre}"?`)) return;
    this.productoService.eliminarProducto(String(producto.codigo)).subscribe({
      next: (res: any) => {
        this.mostrarNotificacion(res.mensaje || 'Producto eliminado', 'success');
        this.listarTodos();
      },
      error: () => {
        this.mostrarNotificacion('Error de conexión al eliminar producto', 'error');
      }

    });
  }

  // ------------------------------------------------------------------
  // UTILIDADES
  // ------------------------------------------------------------------
  cerrarModal() {
    this.productoEnEdicion = null;
    this.erroresEditar = {};
  }

  get editarF() {
    return this.editarForm.controls;
  }

  limitarDigitos(event: any, maxDigitos: number) {
  const valor = event.target.value.toString();
  if (valor.length > maxDigitos) {
    const recortado = valor.slice(0, maxDigitos);
    event.target.value = recortado;
    // Actualiza el form control
    const controlName = (event.target.getAttribute('formControlName'));
    this.crearForm.get(controlName)?.setValue(recortado);
  }
}
  validarDecimal(event: any) {
  let valor = event.target.value;

  // Permitir solo números y máximo 2 decimales
  valor = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
  const partes = valor.split('.');

  if (partes[1]) {
    partes[1] = partes[1].slice(0, 2);
  }

  const final = partes.join('.');

  event.target.value = final;

  const controlName = event.target.getAttribute('formControlName');
  this.crearForm.get(controlName)?.setValue(final);
}

formatPrecio(event: any) {
  const input = event.target;
  let valor = input.value;

  // Guardar posición del cursor antes del cambio
  const cursor = input.selectionStart;

  // Eliminar todo menos números y punto
  let nuevoValor = valor.replace(/[^0-9.]/g, '');

  // Solo permitir un punto decimal
  const partes = nuevoValor.split('.');
  if (partes.length > 2) {
    nuevoValor = partes[0] + '.' + partes[1];
  }

  // Limitar decimales a 2
  if (partes[1]) {
    partes[1] = partes[1].slice(0, 2);
    nuevoValor = partes.join('.');
  }

  // Si el texto cambió, actualizar
  if (nuevoValor !== valor) {
    input.value = nuevoValor;

    // Ajustar posición del cursor sin que regrese al inicio
    const nuevaPos = cursor - (valor.length - nuevoValor.length);
    input.setSelectionRange(nuevaPos, nuevaPos);
  }

  // Actualizar FormControl sin emitir eventos extra
  this.crearForm.get('precio')?.setValue(nuevoValor, { emitEvent: false });
}

mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
  this.notifMensaje = mensaje;
  this.notifTipo = tipo;
  this.notifVisible = true;

  // Ocultar después de 5s
  setTimeout(() => {
    this.notifVisible = false;
  }, 5000);
}

private extraerMensajeError(res: any): string {
  if (res?.error) {
    const mensajes: string[] = [];

    if (Array.isArray(res.error.detalle)) {
      for (let e of res.error.detalle) {
        if (typeof e === 'string') {
          mensajes.push(e);
        } else if (e.campo && e.mensaje) {
          mensajes.push(`${e.campo}: ${e.mensaje}`);
        }
      }
    }

    if (mensajes.length > 0) {
      return mensajes.join('\n');
    }

    if (res.error.mensaje) return res.error.mensaje;
  }

  if (res?.mensaje) return res.mensaje;

  return 'Error en la operación';
}


}
