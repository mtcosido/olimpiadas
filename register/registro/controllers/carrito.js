let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const contenedorTotal = document.querySelector("#total");

function cargarProductosCarrito() {
  if (productosEnCarrito.length > 0) {
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.remove("disabled");
    contenedorCarritoAcciones.classList.remove("disabled");
    contenedorCarritoComprado.classList.add("disabled");

    contenedorCarritoProductos.innerHTML = "";

    productosEnCarrito.forEach(producto => {
      const div = document.createElement("div");
      div.classList.add("carrito-producto");
      div.innerHTML = `
        <div class="carrito-producto-titulo"><small>Título</small><h3>${producto.titulo}</h3></div>
        <div class="carrito-producto-cantidad"><small>Cantidad</small><p>${producto.cantidad}</p></div>
        <div class="carrito-producto-precio"><small>Precio</small><p>$${producto.precio}</p></div>
        <div class="carrito-producto-subtotal"><small>Subtotal</small><p>$${producto.precio * producto.cantidad}</p></div>
        <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
      `;
      contenedorCarritoProductos.append(div);
    });

    actualizarBotonesEliminar();
    actualizarTotal();
  } else {
    contenedorCarritoVacio.classList.remove("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.add("disabled");
  }
}

cargarProductosCarrito();

function actualizarBotonesEliminar() {
  document.querySelectorAll(".carrito-producto-eliminar").forEach(boton => {
    boton.addEventListener("click", eliminarDelCarrito);
  });
}

function eliminarDelCarrito(e) {
  const idBoton = e.currentTarget.id;
  productosEnCarrito = productosEnCarrito.filter(producto => String(producto.id) !== String(idBoton));
  localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
  cargarProductosCarrito();
}

botonVaciar.addEventListener("click", () => {
  Swal.fire({
    title: '¿Estás seguro?',
    icon: 'question',
    html: `Se van a borrar ${productosEnCarrito.length} productos.`,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
  }).then(result => {
    if (result.isConfirmed) {
      productosEnCarrito = [];
      localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
      cargarProductosCarrito();
    }
  });
});

function actualizarTotal() {
  const total = productosEnCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  contenedorTotal.innerText = `$${total}`;
}

botonComprar.addEventListener("click", async () => {
  if (productosEnCarrito.length === 0) {
    alert("No puedes comprar si no tienes productos en el carrito.");
    return;
  }

  try {
    const response = await fetch("/api/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //  Esto permite enviar cookies (como jwt)
      body: JSON.stringify({
        productos: productosEnCarrito,
        formaPago: "Transferencia",
        infoPago: "Compra directa desde carrito"
      })
    });

    const data = await response.json();
    console.log("Respuesta de compra:", data);

    if (data.status === "success") {
      Swal.fire("¡Compra exitosa!", "La factura fue enviada por correo.", "success");
      productosEnCarrito = [];
      localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
      cargarProductosCarrito();

      contenedorCarritoProductos.classList.add("disabled");
      contenedorCarritoAcciones.classList.add("disabled");
      contenedorCarritoComprado.classList.remove("disabled");
    } else {
      alert(data.message || "Hubo un problema con la compra.");
    }

  } catch (error) {
    console.error("Error al enviar la compra:", error);
    alert("Error al procesar la compra.");
  }
});
