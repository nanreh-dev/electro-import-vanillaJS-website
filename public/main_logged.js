if (sessionStorage.getItem("usuario") == null) location = "./index.html";

const d = document;
let $filtros = d.getElementById("filtrosProductos"),
  $iconoFiltrar = d.getElementById("iconoFiltrar"),
  $scrollBtn = d.getElementById("scrollBtn"),
  $productos = d.getElementById("productos-01"),
  $productosLista = d.getElementById("productosLista"),
  $productosGrilla = d.getElementById("productosGrilla"),
  $btnTexto = d.querySelector(".btnTexto"),
  $btnMenu = d.querySelector(".btnMenu"),
  $btnIcono = d.querySelector(".btnIcono"),
  $radioItemsxPagina = d.querySelector(
    'input[name="radioItemsxPagina"]:checked'
  ),
  $prodPag = d.querySelectorAll("#itemsxPagina input"),
  $inputPagina = d.getElementById("inputPagina"),
  $flechaIzq = d.getElementById("flechaIzq"),
  $flechaDer = d.getElementById("flechaDer"),
  $cantPaginas = d.getElementById("cantPaginas"),
  $listaEmbarques = d.getElementById("itemListaEmbarques"),
  $fichaEmbarque = d.getElementById("fichaEmbarques"),
  $tableroControl = d.getElementById("tableroControl"),
  $userLoged = d.getElementById("ingresar"),
  $selectEmbarqueOC = d.getElementById("selectEmbarqueOC"),
  $embarqueNvaOC = d.getElementById("embarqueOC"),
  $footer = d.getElementById("footer"),
  $footerMovil = d.querySelector(".footer-movil"),
  jsonProductos,
  $contenido = [],
  jsonPaginas = [],
  paginas,
  vistaProductos = "lista",
  targetPag,
  paginaAnterior = 1,
  dataProductos = [],
  embarques,
  dataEmbarques = [],
  $producto,
  $tcCardHead,
  $tcCardCuerpo,
  usuario = JSON.parse(sessionStorage.getItem("usuario"));
const HOST = `${location.protocol}//${location.host}`;

if (localStorage.getItem("itemsxPagina") == null)
  localStorage.setItem("itemsxPagina", 15);
$prodPag.forEach((el) => {
  if (el.getAttribute("value") == localStorage.getItem("itemsxPagina"))
    el.checked = true;
});

/* cosas varias */
$inputPagina.value = 1;
$btnTexto.textContent = "Elige un Embarque";
if (usuario.Rol == true) {
  adminItems();
}
$userLoged.innerHTML = `<i class="material-icons align-text-bottom pr-1 tamanoIconosNav">account_circle</i>${usuario.Email}`;

/* navegacion */
location.hash = "#home";
d.querySelector(location.hash).style.display = "block";
let locationHashOld = location.hash;

window.addEventListener(
  "hashchange",
  function () {
    $menuProductos = d.getElementById("menuProductos");
    if (location.hash.includes("#productos")) {
      $menuProductos.style.display = "block";
      productos();
      let paginaHash = parseInt(location.hash.slice(-2));
      if ($inputPagina.value != paginaHash) {
        output(paginaHash);
        $inputPagina.value = paginaHash;
        productosCambiaID($inputPagina.value);
        if ($inputPagina.value == 1) $flechaIzq.classList.add("hidden");
        if ($inputPagina.value < paginas) $flechaDer.classList.remove("hidden");
      }
      return;
    } else $menuProductos.style.display = "none";

    if (location.hash == "#nuevaOC") llenaSelectEmbarqueOC();

    if (location.hash == "#tableroControl") {
      (async function () {
        await pintaTableroControl();
        ($tcCardHead = d.querySelectorAll(".tc-card-tit")),
          ($tcCardCuerpo = d.querySelectorAll(".tc-card-cuerpo"));
        $tcCardHead[0].lastElementChild.classList.add("mdi-chevron-up");
        if (window.innerWidth < 992)
          for (let i = 1; i < $tcCardCuerpo.length; i++)
            $tcCardCuerpo[i].classList.add("tc-card-cuerpo-hide");
      })();
    }

    d.querySelector(locationHashOld).style.display = "none";
    d.querySelector(location.hash).style.display = "block";

    locationHashOld = location.hash;
  },
  false
);

window.addEventListener("scroll", function () {
  /* boton scroll on/off */
  if (scrollY > 800) {
    $scrollBtn.classList.add("scrollVisible");
  } else $scrollBtn.classList.remove("scrollVisible");
});

window.addEventListener("resize", function () {
  if ($tableroControl.style.display == "block") {
    if (window.innerWidth > 991) {
      ($tcCardHead = d.querySelectorAll(".tc-card-tit")),
        ($tcCardCuerpo = d.querySelectorAll(".tc-card-cuerpo"));
      for (let i = 0; i < $tcCardCuerpo.length; i++)
        $tcCardCuerpo[i].classList.remove("tc-card-cuerpo-hide");
    } else
      for (let i = 1; i < $tcCardCuerpo.length; i++)
        $tcCardCuerpo[i].classList.add("tc-card-cuerpo-hide");
  }
  if (window.innerWidth < 768) {
    vistaProductos = "lista";
    borraProductos();
    fetchProductos();
  }
});

window.addEventListener("unload", function () {
  //sessionStorage.setItem('usuario', '');
});

function iconosAcordeon() {
  let $nodo = d.querySelectorAll("button[id*='acordeon']");
  for (let $item of $nodo) {
    if ($item.classList.contains("collapsed")) {
      $item.childNodes[1].textContent = "keyboard_arrow_down";
    } else $item.childNodes[1].textContent = "keyboard_arrow_up";
  }
}

/* paginacion */
async function fetchProductos() {
  try {
    let res = await fetch(`${HOST}/getJson?consulta=ProductosCatalogo`);
    let respuesta = await res.json();
    //dataProductos = JSON.parse(respuesta);
    dataProductos = respuesta;
    console.log(dataProductos);
    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    divideFetchProductos(dataProductos);
  } catch (err) {
    let message = err.statusText || " Ocurrió un error";
    $productosLista.innerHTML = `Error ${err.status}:${message}`;
  } finally {
    /* console.log("desde el finally") */
  }
}

function divideFetchProductos(json) {
  let itemsxPagina = parseInt(localStorage.getItem("itemsxPagina")),
    pagina;
  for (i = 0; i < json.length; i += itemsxPagina) {
    pagina = json.slice(i, i + itemsxPagina);
    jsonPaginas.push(pagina);
  }

  paginas = jsonPaginas.length;

  $cantPaginas.textContent = paginas;
  if (paginas == 1) {
    $flechaDer.classList.add("hidden");
    $inputPagina.disabled = true;
  } else {
    $flechaDer.classList.remove("hidden");
    $inputPagina.disabled = false;
  }
  //$inputPagina.value = 1;
  $flechaIzq.classList.add("hidden");

  if (vistaProductos == "grilla") {
    $productosLista.style.display = "none";
    $productosGrilla.style.display = "block";
    pintaProductosGrilla(jsonPaginas, 0);
  } else {
    $productosLista.style.display = "block";
    $productosGrilla.style.display = "none";
    pintaProductos(jsonPaginas, 0);
  }
}

function pintaProductos(jsonPaginas, pagina) {
  $contenido = jsonPaginas[pagina].map(
    (el) =>
      `<a href="#fichaProductos" class="linkFantasma"><div class="d-flex producto"><div class="containerImg"><img src="${
        el.Fotos[0].Foto
      }" class="productoListaImg"></div><div class="productoListaTex w-100 position-relative"><h5 class="text-center mt-3">${
        el.Modelo
      }</h5><p class="text-center">${
        el.Descripcion == undefined ? "" : el.Descripcion
      }</p><div class="w-100 h-100 position-absolute fakeProducto"></div></div></div></a>`
  );

  $productosLista.innerHTML = $contenido.join("");
  window.scrollTo(0, 0);
}

function pintaProductosGrilla(jsonPaginas, pagina) {
  $contenido = jsonPaginas[pagina].map(
    (el) =>
      `<div class="col-md-6 col-lg-4 p-0 itemGrilla"><a href="#fichaProductos" class="linkFantasmaGrilla"><div class="d-flex flex-column align-items-center bg-white px-md-3 m-md-2 border-light rounded-lg shadow-lg position-relative productoGrilla"><img class="productoGrillaImg" src="${el.Fotos[0].Foto}" alt=""><hr class="w-100"><h6 class="w-100 text-center">${el.Modelo}</h6><p class="text-center">${el.Descripcion}</p><section class="w-100 h-100 position-absolute fakeItemGrilla"></section></div></a></div>`
  );

  d.getElementById("grillaProductos").innerHTML = $contenido.join("");
  window.scrollTo(0, 0);
}

function borraProductos() {
  while ($productosLista.firstChild) {
    $productosLista.removeChild($productosLista.firstChild);
  }
}

function paginadorFlechas(target) {
  if (target == $flechaIzq) {
    $flechaDer.classList.remove("hidden");
    if ($inputPagina.value == cantPaginas)
      $flechaDer.classList.remove("hidden");
    if ($inputPagina.value > 1) {
      $inputPagina.value = parseInt($inputPagina.value) - 1;
      output($inputPagina.value);
      if ($inputPagina.value == 1) $flechaIzq.classList.add("hidden");
    }
    productosCambiaID($inputPagina.value);
  }
  if (target == $flechaDer) {
    $flechaIzq.classList.remove("hidden");
    if ($inputPagina.value < paginas) {
      $inputPagina.value = parseInt($inputPagina.value) + 1;
      output($inputPagina.value);
      if ($inputPagina.value == paginas) $flechaDer.classList.add("hidden");
    }
    productosCambiaID($inputPagina.value);
  }
}

d.addEventListener("keypress", function (e) {
  if (e.keyCode == "13") {
    e.preventDefault();
    targetPag = parseInt($inputPagina.value);
    chequeaTargetPag(targetPag);
    $inputPagina.blur();
    $inputPagina.value > 1
      ? $flechaIzq.classList.remove("hidden")
      : $flechaIzq.classList.add("hidden");
    $inputPagina.value == paginas
      ? $flechaDer.classList.add("hidden")
      : $flechaDer.classList.remove("hidden");
    output($inputPagina.value);
  }
});

function chequeaTargetPag(pagina) {
  if (isNaN(targetPag) || targetPag < 1 || targetPag > paginas) {
    alert("Introduce un número de página válido");
    $inputPagina.value = paginaAnterior;
    return;
  } else {
    $inputPagina.value = pagina;
    productosCambiaID($inputPagina.value);
  }
}

function output(pagina) {
  paginaAnterior = pagina;
  if (vistaProductos == "lista") {
    borraProductos();
    pintaProductos(jsonPaginas, pagina - 1);
  } else {
    borraProductos();
    pintaProductosGrilla(jsonPaginas, pagina - 1);
  }
}

function productoFicha() {
  (producto = dataProductos.filter((el) => el.Modelo == $producto)),
    (miniaturas = []);

  let ficha = `<div class="row">
  <div class="col">
      <h5 class="bg-dark text-light my-3 h4 px-1 font-weight-bold text-center rounded-lg shadow-sm productoFichaTitulo">${
        producto[0].Modelo
      }</h5>
  </div>
</div>
<div class="row bg-light">
  <div class="col-md-4">
      <div id="productoFichaImgCont" class="d-flex flex-column align-items-center position-relative">
          <div id="contadorFichaProducto">
            <span></span>
            <span>/</span>
            <span>${producto[0].Fotos.length}</span>
          </div>
          <div class="d-flex position-absolute w-100 h-100 justify-content-between align-items-center">
              <i class="mdi mdi-chevron-left bg-light imgFlechaIzq imgFlecha"></i>
              <i class="mdi mdi-chevron-right bg-light imgFlechaDer imgFlecha"></i>
          </div>
          <img src="${
            producto[0].Fotos[0].Foto
          }" alt="" id="imagenFichaproducto" class="productoFichaImg imgProducto">
          <div class="productoFichaMiniaturas">
              <i class="material-icons h3 text-secondary bg-white align-text-top lupa">zoom_in</i>
              <img src="${
                producto[0].Fotos[0].Foto
              }" alt="" class="fotoGrande imgProducto">
          </div>
      </div>
  </div>
  <div class="col-md-8">
      <div class="fichaContainer">
          <h5 class="text-center bg-secondary text-light py-1 rounded-lg">${
            producto[0].Descripcion == undefined
              ? "Producto sin descripción"
              : producto[0].Descripcion
          }</h5>
          
      </div>
  </div>
</div>`;

  d.querySelector("#fichaProductos div").innerHTML = ficha;
  ($imagenFichaProducto = d.getElementById("imagenFichaproducto")),
    ($fichaContainer = d.querySelector(".fichaContainer")),
    ($contador = d.getElementById("contadorFichaProducto")),
    ($miniaturas = d.querySelector(".productoFichaMiniaturas")),
    ($fotoGrande = d.querySelector(".fotoGrande")),
    ($flechas = d.querySelectorAll(".imgFlecha"));

  //evalua el numero de foto
  contador = function contador() {
    let imagenActual =
      producto[0].Fotos.findIndex(
        (el) => el.Foto === $imagenFichaProducto.getAttribute("src")
      ) + 1;
    $contador.firstElementChild.innerText = imagenActual;
  };
  //evalua embarque
  if (producto[0].Embarque != undefined) {
    let embarque = `<h6 class="text-center font-weight-light">La fecha más cercana de cierre para adquirir este producto es el ${producto[0].Embarque[0].Cierre} en
    el embarque:<br>${producto[0].Embarque[0].Embarque}<br>La fecha estimada de arribo es el ${producto[0].Embarque[0].ArriboEstimado}.
    </h6>
    <hr class="my-1">
    <h5 class="">FOB <span class="font-weight-light">${producto[0].Embarque[0].FOB}</span></h5>
    <hr class="my-1">
    <h6>Unidad de embalaje: <span class="font-weight-light">${producto[0].UnidadesEmbalaje}</   span></h6>
    <hr class="my-1">
    <h6>M.O.Q.: <span class="font-weight-light">${producto[0].Embarque[0].MOQ}</span></h6>
    <hr class="my-1">`;
    $fichaContainer.insertAdjacentHTML("beforeend", embarque);
  }
  //evalua especificaciones
  if (producto[0].Especificaciones != undefined) {
    let x = [];
    producto[0].Especificaciones.forEach((el) => {
      x.push(`<h6 class="font-weight-light">${el.Especificacion}</h6>`);
    });
    let especificaciones = `<h6 class="m-0">Especificaciones:</h6>
    <div id="productoFichaEspecificaciones">${x.join("")}</div>
    <hr class="my-1">`;
    $fichaContainer.insertAdjacentHTML("beforeend", especificaciones);
  }
  //evalua variantes
  if (producto[0].Variantes != undefined) {
    let variantes = "",
      variantesDescripcion = [],
      variantesVariante = [],
      varianteTempo = "",
      descripcionOld;
    /* simplifica descripcion */
    producto[0].Variantes.forEach((el) => {
      if (el.Descripcion != descripcionOld) {
        variantesDescripcion.push(el.Descripcion);
      }
      descripcionOld = el.Descripcion;
    });
    /* simplifica variantes */
    descripcionOld = producto[0].Variantes[0].Descripcion;
    producto[0].Variantes.forEach((el) => {
      if (el.Descripcion != descripcionOld) {
        varianteTempo = varianteTempo.trim();
        varianteTempo = varianteTempo.slice(0, -1);
        variantesVariante.push(varianteTempo);
        varianteTempo = "";
      }
      varianteTempo += el.Variante + " / ";
      descripcionOld = el.Descripcion;
    });
    varianteTempo = varianteTempo.trim();
    varianteTempo = varianteTempo.slice(0, -1);
    variantesVariante.push(varianteTempo);

    for (let i = 0; i < variantesDescripcion.length; i++) {
      variantes +=
        "<h6 class='font-weight-light'>" +
        variantesDescripcion[i] +
        ": " +
        variantesVariante[i] +
        "</h6>";
    }
    let variantesFinal = `<h6 class="m-0">Variantes:</h6>
    <div id="productoFichaVariantes">${variantes}</div>
    <hr class="my-1">`;
    $fichaContainer.insertAdjacentHTML("beforeend", variantesFinal);
  }

  //inserta miniaturas
  if (producto[0].Fotos.length > 1) {
    for (let i = 1; i < producto[0].Fotos.length; i++) {
      miniaturas.push(
        `<img src="${producto[0].Fotos[i].Foto}" alt="" class="miniatura">`
      );
    }
  } else {
    miniaturas = "";
    $flechas.forEach((el) => (el.style.display = "none"));
  }
  miniaturas.length == 0
    ? $miniaturas.insertAdjacentHTML("afterbegin", miniaturas)
    : $miniaturas.insertAdjacentHTML("afterbegin", miniaturas.join(""));

  contador();
}

function productos() {
  if (!locationHashOld.includes("#productos")) {
    d.querySelector(locationHashOld).style.display = "none";
  }
  $productos.style.display = "block";
  locationHashOld = location.hash;
}

function productosCambiaID(pagina) {
  pagina < 10
    ? (location.hash = `#productos-0${pagina}`)
    : (location.hash = `#productos-${pagina}`);
  let id = location.hash.slice(1);
  $productos.setAttribute("id", id);
}

async function fetchEmbarques() {
  try {
    let res = await fetch(`${HOST}/getJson?consulta=Embarques`);
    let respuesta = await res.json();
    //dataEmbarques = JSON.parse(respuesta);
    dataEmbarques = respuesta;
    if (!res.ok) throw { status: res.status, statusText: res.statusText };
    embarques = dataEmbarques;

    pintaEmbarques(dataEmbarques);
  } catch (err) {
    let message = err.statusText || " Ocurrió un error";
    $productosLista.innerHTML = `Error ${err.status}:${message}`;
  } finally {
    /* console.log("desde el finally") */
  }
}

async function fetchTableroControl() {
  try {
    let res = await fetch(`${HOST}/getJson?consulta=TableroControl`);
    let respuesta = await res.json();
    //dataTC = JSON.parse(respuesta);
    dataTC = respuesta;
    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    return dataTC;
  } catch (err) {
    let message = err.statusText || " Ocurrió un error";
    $selectEmbarqueOC.innerHTML = `Error ${err.status}:${message}`;
  } finally {
    /* console.log("desde el finally") */
  }
}

function pintaEmbarques(datos) {
  dataEmbarques = datos.map(
    (el) =>
      `<div class="row bg-white mx-0 itemLista">
    <div class="col-md-6 embarque">
        <p>${el.Nombre}</p>
        <hr class="m-0">
    </div>
    <div class="col-md-2 text-center fechaCierre">
        <p><span>Fecha de cierre: </span>${el.Fecha_Cierre}</p> 
    </div>
    <div class="col-md-3 text-center fechaArribo">
        <p><span>Fecha estimada arribo: </span>${el.Fecha_Arribo}</p> 
    </div>
    <div class="col-md-1 acciones text-right d-flex justify-content-end align-items-center"><i class="fas fa-ellipsis-h" data-toggle="dropdown"></i>
        <div id="listaEmbarqueDrop" class="dropdown-menu dropdown-menu-right px-2">
            <a class="dropdown-item detalleEmbarque" href="#fichaEmbarques">Detalle Embarque</a>
            ${
              el.Cerrado == "no"
                ? `<a class="dropdown-item" href="#nuevaOC">Orden de Compra</a>`
                : ""
            } 
            <a class="dropdown-item" href="#">Otros</a>
        </div>
    </div>
    </div>`
  );
  $listaEmbarques.innerHTML = dataEmbarques.join("");
}

async function fetchFichaEmbarques(embarque) {
  try {
    let res = await fetch(
      `${HOST}/getJson?consulta=EmbarqueDetalle&Clave=${embarque}`
    );
    let respuesta = await res.json();
    //dataFichaEmbarques = JSON.parse(respuesta);
    dataFichaEmbarques = respuesta;
    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    pintaFichaEmbarques(dataFichaEmbarques);
  } catch (err) {
    let message = err.statusText || " Ocurrió un error";
    $fichaEmbarque.innerHTML = `Error ${err.status}:${message}`;
  } finally {
    /* console.log("desde el finally") */
  }
}

function pintaFichaEmbarques(data) {
  let fichaEmbarque = `<div class="container mb-2">
  <div class="row">
      <div class="col">
          <h5 class="bg-dark text-light text-center fichaTitulo">${
            data[0].Nombre
          }<p>${
    data[0].EmbarqueDescripcion ? data[0].EmbarqueDescripcion : ""
  }</p></h5>
      </div>
  </div>
  <div class="row bg-light">
      <div class="col">
          <div class="fichaContainer mt-0">
              <h6 class="text-center pb-1 bg-secondary text-light rounded-lg">CALENDARIO</h6>
              <h6 class="d-flex justify-content-between">Fecha de cierre<strong>${
                data[0].Fecha_Cierre
              }</strong></h6>
              <hr class="my-1">
              <h6 class="d-flex justify-content-between">Fecha estimada de embarque<strong>${
                data[0].Fecha_Embarque
              }</strong></h6>
              <hr class="my-1">
              <h6 class="d-flex justify-content-between">Fecha estimada de arribo<strong>${
                data[0].Fecha_Arribo
              }</strong></h6>
              <hr class="my-1">
              <h6 class="d-flex justify-content-between">Fecha est. desconsolidación del embarque<strong>${
                data[0].Fecha_Desconsolidacion
              }</strong></h6>
              
              <h6 class="text-center pb-1 bg-secondary text-light rounded-lg">INFORMACION/CONDICIONES</h6>
              <h5 class="tituloMasChico">Condiciones del embarque</h5>
              <hr class="my-1">
              <h5 class="tituloMasChico">Información importante</h5>

              <h6 class="text-center pb-1 m-0 bg-secondary text-light rounded-lg">PRODUCTOS</h6>
              <div class="embarqueListaProductos">

              </div>
              <h6 class="text-center pb-1 mt-2 bg-secondary text-light rounded-lg">ACCIONES</h6>
              <h6 class="text-center">NO TENES UNA ORDEN DE COMPRA EN ESTE EMBARQUE</h6>
              <div class="text-center"><a href="#nuevaOC" class="btn btn-secondary"><span class="bg-light text-secondary rounded-sm px-1">+</span> CREAR UNA</a></div>
          </div>
      </div>
      </div>
      </div>`;
  $fichaEmbarque.innerHTML = fichaEmbarque;
  let fichaEmbarqueProductos = data[0].ProductosEmbarque.map(
    (el) => `<section id="embarqueLista" class="bg-white">
    <a href="#fichaProductos" class="d-block bg-white linkFantasmaEmbarque">
      <div class="d-flex align-items-center productoEmbarque position-relative">
          <div class="containerImgProdEmb"><img class="productoEmbarqueImg position-relative" src="${
            el.Fotos[0].Foto
          }" alt=""></div>
          <div class="embarqueListaTex d-flex flex-column justify-content-between pr-1 w-100">
              <h5 class="text-center">${el.Modelo}</h5>
              <p class="text-center mb-0">${el.Descripcion}</p>
              <div class="embarqueVariantes d-flex flex-sm-row flex-column justify-content-around text-center">${
                el.Variantes
                  ? el.Variantes.map(
                      (el) => `<small>${el.Variante}</small>`
                    ).join("")
                  : ""
              }</div>
              <div class="text-center productoEmbarquePrecioMovil">
                  <p class="d-inline-block bg-secondary text-center text-light p-1 my-1 rounded-lg">Precio FOB: u$s ${
                    el.FOB
                  }</p>
              </div>
              <div class="w-100 h-100 bg-white position-absolute fakeProducto"></div>
          </div>
          <div class="productoEmbarquePrecio">
              <p class="text-center text-light text-nowrap mb-0">Precio FOB:<br>u$s ${
                el.FOB
              }</p>
          </div>
      </div>
    </a>
  </section>`
  ).join("");
  d.querySelector(".embarqueListaProductos").innerHTML = fichaEmbarqueProductos;
}

async function llenaSelectEmbarqueOC() {
  await fetchTableroControl();
  let selectEmbarqueOC = dataTC.abiertos.map(
    (el) => `<p class="btnMenuItem">${el.Nombre}</p>`
  );
  $selectEmbarqueOC.innerHTML = selectEmbarqueOC.join("");
}

async function pintaTableroControl() {
  await fetchTableroControl();
  let estructura = `<div class="container"><div class="row"><div class="col px-lg-1 px-3"><h5 class="tc-head-tit bg-dark text-light h4 font-weight-bold text-center rounded-lg my-2">TABLERO DE CONTROL</h5></div></div><div class="row"><div class="col-lg-4 px-lg-1 px-3 mb-2"><div class="tc-card-tit d-flex justify-content-lg-center justify-content-between  bg-secondary text-light"><h5 class="flex-grow-1 pb-1 px-2 m-0">Embarques</h5><i class="mdi mdi-chevron-down pr-2"></i></div><div class="tc-card-cuerpo px-2"><p class="text-success mb-0">ABIERTOS</p><ul id="abiertosTC" class="nav flex-column tc-card-lista"></ul><div class="tc-ver-todos"><a href="#embarques" class="text-dark getEmbarques">+ ver todos</a></div><p class="text-success mb-0">CERRADOS EN CURSO</p><ul id="cerradosTC" class="nav flex-column tc-card-lista"></ul><div class="tc-ver-todos"><a href="#embarques" class="text-dark">+ ver todos</a></div></div></div><div class="col-lg-4 px-lg-1 px-3 mb-2"><div class="tc-card-tit d-flex justify-content-lg-center justify-content-between  bg-secondary text-light"><h5 class="flex-grow-1 pb-1 px-2 m-0">Productos</h5><i class="mdi mdi-chevron-down pr-2"></i></div><div class="tc-card-cuerpo px-2"><p class="text-success mb-0">DESTACADOS</p><ul id="destacadosTC" class="nav flex-column tc-card-lista"></ul><div class="tc-ver-todos"><a href="#productos-01" class="text-dark getProductos">+ ver todos</a></div></div></div><div class="col-lg-4 px-lg-1 px-3 mb-2"><div class="tc-card-tit d-flex justify-content-lg-center justify-content-between  bg-secondary text-light"><h5 class="flex-grow-1 pb-1 px-2 m-0">Ordenes de Compra</h5><i class="mdi mdi-chevron-down pr-2"></i></div><div class="tc-card-cuerpo px-2"><p class="text-success mb-0">ABIERTAS</p><ul class="nav flex-column tc-card-lista"><li class="nav-item"><a href="" class="nav-link mb-1 text-dark bg-light"><b>Marcelo Arre</b><p class="ml-3 text-justify">OC Prueba Rediseño</p></a></li></ul>
  <div class="tc-ver-todos"><a href="" class="text-dark">+ nueva orden de compra</a></div><p class="text-success mb-0">CERRADAS</p><ul class="nav flex-column tc-card-lista"></ul><div class="tc-ver-todos"><a href="" class="text-dark">+ nueva orden de compra</a></div></div></div></div></div>`;
  $tableroControl.innerHTML = estructura;
  let embarquesAbiertos = dataTC.abiertos
    .map(
      (el) =>
        `<li class="nav-item"><a href="#fichaEmbarques" class="nav-link mb-1 text-dark bg-light position-relative linkFantasmaTC detalleEmbarqueTC"><b>${
          el.Nombre
        }</b><p class="ml-3 text-justify">${
          el.Descripcion != undefined ? el.Descripcion : ""
        }</p><div class="w-100 h-100 position-absolute fakeProducto"></div></a></li>`
    )
    .join("");
  d.getElementById("abiertosTC").innerHTML = embarquesAbiertos;
  let embarquesCerrados = dataTC.cerrados
    .map(
      (el) =>
        `<li class="nav-item"><a href="#fichaEmbarques" class="nav-link mb-1 text-dark bg-light position-relative linkFantasmaTC detalleEmbarqueTC"><b>${
          el.Nombre
        }</b><p class="ml-3 text-justify">${
          el.Descripcion != undefined ? el.Descripcion : ""
        }</p><div class="w-100 h-100 position-absolute fakeProducto"></div></a></li>`
    )
    .join("");
  d.getElementById("cerradosTC").innerHTML = embarquesCerrados;
  let productosDestacados = dataTC.destacados
    .map(
      (
        el
      ) => `<li class="nav-item"><a href="#fichaProductos" class="d-flex justify-content-center align-items-center nav-link mb-1 text-dark bg-light position-relative linkFantasmaDestacado">
  <div class="destacadoImg"><img src="${el.Fotos[0].Foto}" alt=""></div>
  <div class="flex-grow-1">
  <h6 class="text-center font-weight-bolder m-0">${el.Modelo}</h6>
  <p class="text-center">${
    el.Descripcion != undefined ? el.Descripcion : ""
  }</p></div><div class="w-100 h-100 position-absolute fakeProducto"><div class="w-100 h-100 position-absolute fakeProducto"></div></div>
  </a></li>`
    )
    .join("");
  d.getElementById("destacadosTC").innerHTML = productosDestacados;
}

async function getFichaProducto() {
  await fetchProductos();
  productoFicha();
}

function adminItems() {
  let $referencia = d.getElementById("logo");
  $referencia.insertAdjacentHTML(
    "afterend",
    `<ul class="navbar-nav m-auto d-lg-none d-flex"><li class="nav-item dropdown notificaciones"><a class="nav-link p-0 ml-0 ml-md-3 deshabilitarEnlaces enlaceCampana" data-toggle="dropdown" href="#"><i class="material-icons d-inline align-text-bottom campana">notifications</i></a><p class="notificacion m-0 font-weight-bold d-none"></p><div class="bg-dark dropdown-menu dropdown-menu-right position-absolute menuNotificaciones"></div></li></ul>`
  );
  $referencia = d.getElementById("usuario");
  $referencia.insertAdjacentHTML(
    "afterend",
    `<li class="nav-item dropdown notificaciones"><a class="nav-link p-0 ml-0 ml-md-3 d-lg-flex d-none deshabilitarEnlaces enlaceCampana" data-toggle="dropdown" href="#"><i class="material-icons d-inline align-text-bottom campana">notifications</i></a><p class="notificacion m-0 font-weight-bold d-lg-none d-none"></p><div class="bg-dark dropdown-menu dropdown-menu-right position-absolute menuNotificaciones"></div></li>`
  );
  $footer.insertAdjacentHTML(
    "beforeend",
    `<li id="users-ol" class="nav-item dropdown d-flex align-items-center"><a class="nav-link itemsFooter deshabilitarEnlaces enlaceUsuarios" data-toggle="dropdown" href="#"><div class="online-light d-inline-block"></div><span class="users-title">Nadie en linea</span></a><div class="dropdown-menu bg-dark menuUsuarios"></div></li>`
  );
  $footerMovil.insertAdjacentHTML(
    "beforeend",
    `<li id="users-ol-movil" class="nav-item dropdown d-flex align-items-center d-lg-none"><a class="nav-link deshabilitarEnlaces enlaceUsuarios" data-toggle="dropdown" href="#"><div class="online-light d-inline-block"></div><span class="users-title">Nadie en linea</span></a><div class="dropdown-menu bg-dark menuUsuarios"></div></li>`
  );
}

function getFecha() {
  let date = new Date();
  let dia = date.getDate();
  let mes = date.getMonth();
  let ano = date.getFullYear();
  let fecha = `${dia}/${mes}/${ano}`;
  return fecha;
}

//websockets
const socket = io(),
  $loggedUsers = d.getElementById("logged-users");
let loggedUsers;
let usuarioLocal = JSON.parse(sessionStorage.getItem("usuario")),
  notificacion = 1;
socket.emit("usuario", { user: usuario.Email, rol: usuario.Rol });
socket.on("logueado", (data) => {
  loggedUsers = Object.values(data.users);
  //console.log(data);
  if (usuarioLocal.Rol == true)
    if (data.user != usuarioLocal.Nombre) userLogged(data.user);
  usersLogged(loggedUsers);
});
socket.on("usuario desconectado", (data) => {
  loggedUsers = Object.values(data);
  usersLogged(loggedUsers);
});
socket.on("notiOC", (data) => {
  if (usuarioLocal.Rol == true) {
    //console.log(data)
    if (usuarioLocal.Email != data.user) {
      $notificacion = d.querySelectorAll(".notificacion");
      $notificacion[0].classList.add("d-inline");
      $notificacion[0].textContent = notificacion;
      $notificacion[1].classList.add("d-lg-inline");
      $notificacion[1].textContent = notificacion;
      notificacion++;

      $tempo = d.querySelectorAll(".enlaceCampana");
      $tempo.forEach((el) => {
        el.classList.remove("deshabilitarEnlaces");
      });
      $tempo = d.querySelectorAll(".menuNotificaciones");
      $tempo.forEach((el) => {
        el.insertAdjacentHTML(
          "beforeend",
          `<p class="text-light"><b class="text-info">${getFecha()}: ${
            data.user
          }</b> ha emitido una orden de compra en el embarque: <b class="text-info">${
            data.embarque
          }</b></p><hr class="bg-secondary m-0 p-0">`
        );
      });
    }
  }
});
function userLogged(data) {
  let div = d.createElement("div");
  div.insertAdjacentHTML(
    "beforeend",
    `<b class="text-info">${data}</b> está en línea`
  );
  $loggedUsers.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 3000);
}
function usersLogged(users) {
  let $enlaces = d.querySelectorAll(".enlaceUsuarios"),
    $tempo = d.querySelectorAll(".menuUsuarios"),
    $onlineLight = d.querySelectorAll(".online-light"),
    $usersTitle = d.querySelectorAll(".users-title");
  if (users.length > 1) {
    $enlaces.forEach((el, index) => {
      el.classList.remove("deshabilitarEnlaces");
      $onlineLight[index].style =
        "background: red; box-shadow: 0px 0px 7px 3px red;";
      users.length == 2
        ? ($usersTitle[index].innerHTML = `${
            users.length - 1
          } usuario en línea`)
        : ($usersTitle[index].innerHTML = `${
            users.length - 1
          } usuarios en línea`);
    });
    $tempo.forEach((el) => {
      el.innerHTML = users
        .map((el) =>
          el != usuario.Email ? `<p class="text-info p-2">${el}</p>` : ""
        )
        .join('<hr class="m-0 bg-secondary">');
    });
  } else {
    $enlaces.forEach((el, index) => {
      el.classList.add("deshabilitarEnlaces");
      $onlineLight[index].style =
        "background: var(--marcosFinos); box-shadow: none;";
      $tempo.innerHTML = "";
      $usersTitle[index].innerHTML = "Nadie en línea";
    });
  }
}

/* listeners */
d.addEventListener(
  "click",
  function (e) {
    //console.log(e.target);
    if (e.target.classList.contains("cierraHambur")) {
      $(".navbar-collapse").collapse("hide");
    }
    if (e.target.classList.contains("acordeon")) {
      iconosAcordeon();
    }
    if (e.target.classList.contains("filtrarBtn")) {
      $filtros.classList.toggle("filtrosProductosToggle");
      $iconoFiltrar.classList.toggle("mdi-chevron-up");
    }
    if (e.target.classList.contains("scrollBtn")) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
    if (e.target.classList.contains("getProductos")) {
      $productosLista.style.display = "block";
      $productosGrilla.style.display = "none";
      fetchProductos();
    }
    if (e.target.classList.contains("lista")) {
      $productosLista.style.display = "block";
      $productosGrilla.style.display = "none";
      vistaProductos = "lista";
      output($inputPagina.value);
    }
    if (e.target.classList.contains("grilla")) {
      $productosLista.style.display = "none";
      $productosGrilla.style.display = "block";
      vistaProductos = "grilla";
      output($inputPagina.value);
    }
    if (e.target.classList.contains("miniatura")) {
      let miniatura = e.target.getAttribute("src");
      let miniaturaOld = $imagenFichaProducto.getAttribute("src");
      $imagenFichaProducto.setAttribute("src", miniatura);
      $fotoGrande.setAttribute("src", miniatura);
      e.target.setAttribute("src", miniaturaOld);
      contador();
    }
    if (e.target.classList.contains("imgFlechaDer")) {
      let imagenActualIndice = producto[0].Fotos.findIndex(
        (el) => el.Foto === $imagenFichaProducto.getAttribute("src")
      );
      let cambiaMiniatura = producto[0].Fotos[imagenActualIndice].Foto;
      if (imagenActualIndice + 1 != producto[0].Fotos.length) {
        let nuevaImagen = producto[0].Fotos[imagenActualIndice + 1].Foto;
        $imagenFichaProducto.setAttribute("src", nuevaImagen);
        $fotoGrande.setAttribute("src", nuevaImagen);
        contador();
        d.querySelector(`.miniatura[src="${nuevaImagen}"]`).setAttribute(
          "src",
          cambiaMiniatura
        );
      }
    }
    if (e.target.classList.contains("imgFlechaIzq")) {
      let imagenActualIndice = producto[0].Fotos.findIndex(
        (el) => el.Foto === $imagenFichaProducto.getAttribute("src")
      );
      let cambiaMiniatura = producto[0].Fotos[imagenActualIndice].Foto;
      if (imagenActualIndice != 0) {
        let nuevaImagen = producto[0].Fotos[imagenActualIndice - 1].Foto;
        $imagenFichaProducto.setAttribute("src", nuevaImagen);
        $fotoGrande.setAttribute("src", nuevaImagen);
        contador();
        d.querySelector(`.miniatura[src="${nuevaImagen}"]`).setAttribute(
          "src",
          cambiaMiniatura
        );
      }
    }
    if (e.target.classList.contains("caretAyuda")) {
      iconosAcordeon();
    }
    if (e.target.classList.contains("btnIcono")) {
      e.target.classList.toggle("btnRotar");
      $btnMenu.classList.toggle("btnMenuMostrar");
    }
    if (e.target.classList.contains("btnMenuItem")) {
      let contenido = e.target.textContent;
      $btnTexto.textContent = contenido;
      $btnMenu.classList.toggle("btnMenuMostrar");
      $btnIcono.classList.toggle("btnRotar");
    }
    if (e.target.matches(".tc-card-tit *") && window.innerWidth < 992) {
      e.target.parentNode.nextElementSibling.classList.toggle(
        "tc-card-cuerpo-hide"
      );
      e.target.parentNode.lastElementChild.classList.toggle("mdi-chevron-up");
    }
    if (e.target == $inputPagina) {
      $inputPagina.value = "";
    }
    if (e.target == $flechaIzq) {
      paginadorFlechas(e.target);
    }
    if (e.target == $flechaDer) {
      paginadorFlechas(e.target);
    }
    if (e.target.matches(".prodPag")) {
      localStorage.setItem("itemsxPagina", e.target.value);
      fetchProductos();
    }
    if (e.target.matches(".linkFantasma *")) {
      $producto =
        e.target.parentNode.parentNode.lastElementChild.firstChild.textContent;
      productoFicha();
    }
    if (e.target.matches(".linkFantasmaGrilla *")) {
      $producto = e.target.parentNode.childNodes[2].textContent;
      productoFicha();
    }
    if (e.target.matches(".getEmbarques")) {
      fetchEmbarques();
    }
    if (e.target.matches(".detalleEmbarque")) {
      let embarqueSeleccionado =
        e.target.parentNode.parentNode.parentNode.firstElementChild
          .firstElementChild.textContent;
      //embarqueSeleccionado = "/json/"+embarqueSeleccionado+".json";
      fetchFichaEmbarques(embarqueSeleccionado);
    }
    if (e.target.matches(".linkFantasmaEmbarque *")) {
      e.target.parentNode.parentNode.childNodes[1].textContent
        ? ($producto = e.target.parentNode.parentNode.childNodes[1].textContent)
        : ($producto =
            e.target.parentNode.parentNode.childNodes[3].firstElementChild
              .textContent);
      getFichaProducto();
    }
    if (e.target.matches(".linkFantasmaTC *")) {
      let embarqueSeleccionado = e.target.parentNode.firstChild.textContent;
      //embarqueSeleccionado = "/json/"+embarqueSeleccionado+".json";
      //loader('$fichaEmbarque');
      fetchFichaEmbarques(embarqueSeleccionado);
    }
    if (e.target.matches(".linkFantasmaDestacado *")) {
      $producto =
        e.target.parentNode.parentNode.childNodes[3].firstElementChild
          .textContent;
      getFichaProducto();
    }
    if (e.target.matches(".cerrarSesion")) {
      sessionStorage.setItem("usuario", "");
      location = "./index.html";
    }
    if (e.target.matches("#guardarOrdenCompra")) {
      if ($embarqueNvaOC.textContent == "Elige un Embarque") {
        alert("Elige un Embarque");
        return false;
      }
      location.hash = "#home";
      socket.emit("ordenCompra", {
        user: usuario.Email,
        embarque: $embarqueNvaOC.textContent,
      });
    }
  },
  false
);

//maldito bootstrap
$campana = d.querySelectorAll(".campana");
$campana.forEach((el) =>
  el.addEventListener("click", borraNotificaciones, false)
);

function borraNotificaciones() {
  $notificacion = d.querySelectorAll(".notificacion");
  notificacion = 1;
  $notificacion[0].classList.remove("d-inline");
  $notificacion[0].textContent = notificacion;
  $notificacion[1].classList.remove("d-lg-inline");
  $notificacion[1].textContent = notificacion;
}
