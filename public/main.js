let $nodoRef,
  locationHashOld = "",
  $navegacion = document.getElementById("navegacion"),
  $scrollBtn = document.getElementById("scrollBtn"),
  itemParallax = document.querySelector(".infoContenedor");

const $form = document.getElementById("login");
const HOST = `${location.protocol}//${location.host}`;

/* navegacion */
location.hash = "";

if (window.innerWidth > 991) {
  if ($navegacion.classList.contains("position-absolute")) {
    $navegacion.classList.replace("position-absolute", "fixed-top");
  }
}
if (window.innerWidth < 992) {
  if ($navegacion.classList.contains("fixed-top"))
    $navegacion.classList.replace("fixed-top", "position-absolute");
}

window.addEventListener(
  "hashchange",
  function () {
    if (location.hash == "") {
      cierraContenedor();
    }

    if (!location.hash == "") {
      document.querySelector(".miModal").style.display = "flex";
      document.querySelector(location.hash).style.display = "block";
    }

    if (!locationHashOld == "") {
      document.querySelector(locationHashOld).style.display = "none";
    }
    locationHashOld = location.hash;
  },
  false
);

reduceMargenes();

window.onresize = reduceMargenes;

/* clicks */
document.addEventListener(
  "click",
  function (e) {
    if (e.target.classList.contains("cierraHambur")) {
      $(".navbar-collapse").collapse("hide");
    }
    if (e.target.classList.contains("contenidoModal")) {
      fijaHome();
    }
    if (e.target.classList.contains("cierraContainer")) {
      cierraContenedor();
    }
    if (e.target.classList.contains("link")) {
      //location = "/index_logged.html#home";
    }
    if (e.target.classList.contains("scrollBtn")) {
      window.scrollTo({ behavior: "smooth", top: 0 });
    }
  },
  false
);

/* parallax */
window.addEventListener("scroll", function () {
  let posicionY = window.pageYOffset;
  let posicionParallax = -posicionY * 0.5;
  itemParallax.style.transform = "translateY(" + posicionParallax + "px)";

  if (posicionY > 800) {
    $scrollBtn.classList.add("scrollVisible");
  } else $scrollBtn.classList.remove("scrollVisible");
});

document.addEventListener(
  "focus",
  function (e) {
    if (e.target.localName == "input") {
      e.target.placeholder = "";
      e.target.style.background = "white";
    }
  },
  true
);

//envia formularios
document.addEventListener("submit", function (e) {
  //console.log(e.target)
  e.preventDefault();
  let formData = new FormData(e.target);
  let jsonForm = {};
  for (let key of formData.keys()) {
    jsonForm[key] = formData.get(key);
  }
  jsonForm = JSON.stringify(jsonForm);
  forms();
  async function forms() {
    try {
      let res = await fetch(`${HOST}/login`, {
        method: "POST",
        body: jsonForm,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw { status: res.status, statusText: res.statusText };

      let respuesta = await res.json();
      console.log(respuesta);
      let $pass = document.querySelector(".password"),
        $mail = document.querySelector(".email");
      if (respuesta.Email == "Usuario Inexistente") {
        $mail.value = "";
        $mail.setAttribute("placeholder", respuesta.Email);
        $mail.style.background = "red";
        $pass.value = "";
        return;
      }
      if (respuesta.Password == "Contraseña Inválida") {
        $pass.value = "";
        $pass.setAttribute("placeholder", respuesta.Password);
        $pass.style.background = "red";
        return;
      }
      respuesta.Password = "";
      sessionStorage.setItem("usuario", JSON.stringify(respuesta));
      //console.log(sessionStorage.getItem('usuario'))
      location = "/index_logged.html#home";
    } catch (err) {
      let message = err.statusText || " Ocurrió un error";
    } finally {
    }
  }
});

/* funciones */
function fijaHome() {
  $nodoRef = document.querySelector(".infoContenedor");
  $nodoRef.style.position = "fixed";
  $nodoRef.style.visibility = "hidden";
}

function reduceMargenes() {
  if (window.innerWidth > 991) {
    if ($navegacion.classList.contains("position-absolute")) {
      $navegacion.classList.replace("position-absolute", "fixed-top");
    }
  }
  if (window.innerWidth < 992) {
    if ($navegacion.classList.contains("fixed-top"))
      $navegacion.classList.replace("fixed-top", "position-absolute");
  }

  if (window.innerWidth < 577) {
    $(".infoContenedor").css("top", window.innerHeight - 50);
    if (window.innerHeight < 618)
      $(".navbarFalso").css("margin-bottom", "3rem");
    else $(".navbarFalso").css("margin-bottom", "16rem");
  } else if (window.innerWidth < 768) {
    $(".infoContenedor").css("top", window.innerHeight - 67);
    if (window.innerHeight < 618)
      $(".navbarFalso").css("margin-bottom", "3rem");
    else $(".navbarFalso").css("margin-bottom", "16rem");
  } else {
    $(".infoContenedor").css("top", window.innerHeight - 75);
    if (window.innerHeight < 618)
      $(".navbarFalso").css("margin-bottom", "3rem");
    else $(".navbarFalso").css("margin-bottom", "16rem");
  }
}

/* cierra contenedor html externo */
function cierraContenedor() {
  document.querySelector(".miModal").style.display = "none";
  $nodoRef = document.querySelector(".infoContenedor");
  $nodoRef.style.position = "absolute";
  $nodoRef.style.visibility = "visible";
  location.hash = "";
}

//google sigin
function onSuccess(googleUser) {
  //console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  var id_token = googleUser.getAuthResponse().id_token;
  var profile = googleUser.getBasicProfile();
  //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  //console.log('Name: ' + profile.getName());
  //console.log('Image URL: ' + profile.getImageUrl());
  //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  //console.log(id_token);
}
function onFailure(error) {
  console.log(error);
}
function renderButton() {
  gapi.signin2.render("my-signin2", {
    scope: "profile email",
    width: 200,
    height: 28,
    longtitle: true,
    theme: "dark",
    onsuccess: onSuccess,
    onfailure: onFailure,
  });
}
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log("User signed out.");
  });
}
//window.onunload = signOut;
//fin google sigin

//facebook sigin
function statusChangeCallback(response) {
  // Called with the results from FB.getLoginStatus().
  //console.log('statusChangeCallback');
  //console.log(response);                   // The current login status of the person.
  if (response.status === "connected") {
    // Logged into your webpage and Facebook.
    testAPI();
  } else {
    // Not logged into your webpage or we are unable to tell.
    //document.getElementById('status').innerHTML = 'Inicia sesión ' +
    //  'para continuar.';
  }
}

function checkLoginState() {
  // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function (response) {
    // See the onlogin handler
    statusChangeCallback(response);
  });
}

/* window.fbAsyncInit = function () {
  FB.init({
    appId: '330829615313064',
    cookie: true,
    xfbml: true,
    version: 'v11.0'
  });


  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
} */

function testAPI() {
  // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  console.log("Welcome!  Fetching your information.... ");
  FB.api("/me", function (response) {
    console.log("Successful login for: " + response.name);
    //document.getElementById('status').innerHTML =
    //  'Gracias por Iniciar Sesión, ' + response.name + '!';
  });
}
//logout
/* FB.logout(function(response) {});

function fbLogoutUser() {
    FB.getLoginStatus(function(response) {
        if (response && response.status === 'connected') {
            FB.logout(function(response) {
                document.location.reload();
            });
        }
    });
}
//fin facebook sigin */
