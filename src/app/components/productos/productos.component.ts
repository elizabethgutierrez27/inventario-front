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
    .pipe(
      debounceTime(300)
    )
    .subscribe(values => {
      const { nombre, categoria, proveedor } = values;

      if (!nombre && !categoria && !proveedor) {
        this.listarTodos();
        return;
      }

      this.filtrar();
    });
  }


  // ------------------------------------------------------------------
  // FILTROS
  // ------------------------------------------------------------------
  filtrar() {
    const filtros = this.filtrosForm.value;
    if (!filtros.nombre && !filtros.categoria && !filtros.proveedor) {
      alert('Debe enviar al menos un campo para filtrar');
      return;
    }

    this.productoService.filtrarProductos(filtros).subscribe({
      next: (res: any) => {
        if (res.codigo === 0) {
          this.productos = res.productos;
        } else {
          alert(res.mensaje || 'Error al filtrar productos');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al filtrar productos');
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
      error: (err) => {
        console.error(err);
        alert('Error de conexión al cargar productos');
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
      error: (err) => {
        console.error(err);
        alert('Error de conexión al cargar categorías');
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

        if (res.codigo === 2 && res.error?.detalle?.length > 0) {
          this.erroresCrear = {};
          let mensajesGlobales: string[] = [];

          for (let err of res.error.detalle) {
            if (err.campo) {
              this.erroresCrear[err.campo] = err.mensaje;
            } else {
              mensajesGlobales.push(err.mensaje);
            }
          }

          if (mensajesGlobales.length > 0) {
            alert(mensajesGlobales.join('\n'));
          }
          return;
        }

        // ✅ Éxito
        alert(res.mensaje);
        if (res.codigo === 0) {
          this.listarTodos();
          this.crearForm.reset({
            id_categoria: this.categorias[0]?.id,
            cantidad: 0,
            stock: 0,
            precio: 0
          });
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al crear producto');
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
        // Validaciones de backend
        if (res.codigo === 2 && res.error?.detalle?.length > 0) {
          this.erroresEditar = {};
          let mensajesGlobales: string[] = [];

          for (let err of res.error.detalle) {
            if (typeof err === 'string') {
              mensajesGlobales.push(err);
            } else if (err.campo) {
              this.erroresEditar[err.campo] = err.mensaje;
            }
          }

          if (mensajesGlobales.length > 0) {
            alert(mensajesGlobales.join('\n'));
          }

          return;
        }

        // Éxito
        alert(res.mensaje);
        if (res.codigo === 0) {
          const index = this.productos.findIndex(p => p.codigo === productoActualizado.codigo);
          if (index !== -1) {
            const actualizado = res.producto;
            actualizado.categoria_nombre =
              this.categorias.find(c => c.id === actualizado.id_categoria)?.nombre || '';
            this.productos[index] = actualizado;
          }
          this.cerrarModal();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al actualizar producto');
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
        alert(res.mensaje || 'Producto eliminado correctamente');
        this.listarTodos();
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al eliminar producto');
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

}
