import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { CategoriasService } from '../../services/categorias.service';

interface Producto {
  codigo: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  stock: number;
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
  selector: 'app-verproductos',
  templateUrl: './verproductos.component.html',
  styleUrls: ['./verproductos.component.css']
})
export class VerproductosComponent implements OnInit {

  productos: Producto[] = [];
  categorias: Categoria[] = [];

  constructor(
    private productoService: ProductosService,
    private categoriaService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.listarTodos();
    this.listarCategorias();
  }

  listarTodos() {
    this.productoService.listarProductos().subscribe({
      next: (res: any) => {
        this.productos = res.lista || res.productos || [];
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar productos');
      }
    });
  }

  listarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res.lista || res.categorias || [];
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar categorías');
      }
    });
  }

  obtenerNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.id === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }
}
