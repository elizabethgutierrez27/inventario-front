import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';

interface Producto {
  codigo: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  stock: number;
  precio: number;
  proveedor: string;
  id_categoria: number;
  imagen: string;
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

  filtrosCollapsed = true;  // Comienza colapsado
  crearCollapsed = true;

  productoEnEdicion: Producto | null = null;

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
    this.crearForm = this.fb.group({
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      cantidad: [0],
      stock: [0],
      precio: [0],
      proveedor: [''],
      id_categoria: [null],
      imagen: ['']
    });
  }

  ngOnInit(): void {
    this.listarTodos();
    this.listarCategorias();

    this.editarForm = this.fb.group({
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      cantidad: [0],
      stock: [0],
      precio: [0],
      proveedor: [''],
      id_categoria: [null],
      imagen: ['']
    });
  }

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

  crear() {
    const producto = this.crearForm.value;

    this.productoService.crearProducto(producto).subscribe({
      next: (res: any) => {
        alert(res.mensaje);
        if (res.codigo === 0) {
          this.listarTodos();
          this.crearForm.reset({ id_categoria: this.categorias[0]?.id, cantidad: 0, stock: 0, precio: 0 });
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al crear producto');
      }
    });
  }

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

  editar(producto: Producto) {
    this.productoEnEdicion = { ...producto };
    this.editarForm.patchValue(this.productoEnEdicion);
  }

  guardarCambios() {
    const productoActualizado = this.editarForm.value;

    this.productoService.actualizarProducto(productoActualizado).subscribe({
      next: (res: any) => {
        alert(res.mensaje);
        if (res.codigo === 0) {
          const index = this.productos.findIndex(p => p.codigo === productoActualizado.codigo);
          if (index !== -1) {
            const actualizado = res.producto;
            actualizado.categoria_nombre = this.categorias.find(c => c.id === actualizado.id_categoria)?.nombre || '';
            this.productos[index] = actualizado;
          }
        }
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        alert('Error de conexión al actualizar producto');
      }
    });
  }

  cerrarModal() {
    this.productoEnEdicion = null;
  }
}
