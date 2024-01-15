"use strict";

const express = require("express"),
  path = require("path"),
  app = express(),
  socketio = require("socket.io");

//usar solo en caso de no poder usar la db
const catalogoProductos = require("./public/json/catalogo_productos.json");
const usuarios = require("./public/json/usuarios.json");
const embarques = require("./public/json/embarques.json");
const tableroControl = require("./public/json/tablero_control.json");
const HIGHBAY_UFO_MAY_2020 = require("./public/json/Luminaria HIGH BAY (UFO) MAY-2020.json");
const HIGHBAY_UFO_ENE_2020 = require("./public/json/Luminaria HIGH BAY (UFO) ENE-2020.json");
const PANELES_TUBOS_TORTUGAS_SEP_2020 = require("./public/json/Paneles, Tubos y Tortugas SEP-2020.json");
const PANELES_TUBOS_TORTUGAS_MAR_2020 = require("./public/json/Paneles, Tubos y Tortugas MAR-2020.json");
const PROYECTORES_JUN_2020 = require("./public/json/Proyectores (Floodlights) JUN-2020.json");
const TEST = require("./public/json/Embarque Test.json");
const LAMPARAS_JUN_2020 = require("./public/json/Lámparas JUN-2020.json");
const LAMPARAS_MAR_2020 = require("./public/json/Lámparas MAR-2020.json");

//app.set("port", process.env.PORT || 3000);

//arranca server
/* const server = app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
}); */
const server = app.listen(process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")));

//websockets
let delay = 0,
  loggedUsers = {};
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("usuario", (data) => {
    loggedUsers[socket.id] = data.user;
    //console.log(loggedUsers,data)
    io.emit("logueado", { user: data.user, users: loggedUsers });
  });
  socket.on("ordenCompra", (data) => {
    io.emit("notiOC", data);
  });
  socket.on("disconnect", () => {
    delete loggedUsers[socket.id];
    io.emit("usuario desconectado", loggedUsers);
    //console.log(loggedUsers)
  });
});

//json desde la db
/* app.get("/getJson", function (req, res) {
  let consulta = req.query.consulta;
  let clave = req.query.Clave;
  getJson(consulta, clave)
    .then((datos) => {
      let resultado = datos.recordset[0][consulta];
      res.json(resultado);
    })
    .catch((error) => {
      console.log(`Hubo un error`);
    });
}); */

//app.use(express.urlencoded({extended:false})); //para formularios
app.use(express.json());

//procesa formularios
app.post("/login", async function (req, res) {
  let estado = await chequeaLogin(req.body.loginEmail, req.body.loginPassword);
  res.json(estado);
});

//endpoints para json
app.get("/getJson", function (req, res) {
  let consulta = req.query.consulta;
  let clave = req.query.Clave;

  switch (consulta) {
    case "ProductosCatalogo":
      res.json(catalogoProductos);
      break;
    case "Embarques":
      res.json(embarques);
      break;
    case "TableroControl":
      res.json(tableroControl);
      break;
    case "EmbarqueDetalle":
      switch (clave) {
        case "Luminaria HIGH BAY (UFO) MAY-2020":
          res.json(HIGHBAY_UFO_MAY_2020);
          break;
        case "Paneles, Tubos y Tortugas SEP-2020":
          res.json(PANELES_TUBOS_TORTUGAS_SEP_2020);
          break;
        case "Proyectores (Floodlights) JUN-2020":
          res.json(PROYECTORES_JUN_2020);
          break;
        case "Lámparas JUN-2020":
          res.json(LAMPARAS_JUN_2020);
          break;
        case "Embarque Test":
          res.json(TEST);
          break;
        case "Proyectores (Floodlights)  MAR-2020":
          res.json(PROYECTORES_JUN_2020);
          break;
        case "Lámparas MAR-2020":
          res.json(LAMPARAS_MAR_2020);
          break;
        case "Paneles, Tubos y Tortugas MAR-2020":
          res.json(PANELES_TUBOS_TORTUGAS_MAR_2020);
          break;
        case "Luminaria HIGH BAY (UFO) ENE-2020":
          res.json(HIGHBAY_UFO_ENE_2020);
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  /* getJson(consulta, clave)
    .then((datos) => {
      let resultado = datos.recordset[0][consulta];
      res.json(resultado);
    })
    .catch((error) => {
      console.log(`Hubo un error`);
    }); */
});

//obtiene jsons de la DB
/* async function getJson(parametro, clave) {
  try {
    await sql.connect(config);
    let db = new sql.Request();
    let consulta = consultas[parametro];
    if (clave != undefined)
      consulta = consulta.replace("reemplazar", `'${clave}'`);
    let datos = await db.query(consulta);
    return datos;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
} */

//cheque login desde json
function chequeaLogin(email, password) {
  let res = { Email: "", Password: "", Rol: true };
  try {
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].Email == email) {
        res = { ...res, Email: usuarios[i].Email };
        if (usuarios[i].Email == "user2@mail.com") res = { ...res, Rol: false };
        if (usuarios[i].Password != password) {
          res = { ...res, Password: "Contraseña Inválida" };
        } else res = { ...res, Password: usuarios[i].Password };
        break;
      } else {
        res = { ...res, Email: "Usuario Inexistente", Password: "" };
      }
    }
    return res;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
}

//chequea login de la DB
/* async function chequeaLogin(email, password) {
  try {
    await sql.connect(config);
    let db = new sql.Request();
    let usuario =
      await db.query(`IF EXISTS(select * from Usuarios where Email = '${email}')
      BEGIN
          SELECT Nombre, Password, Rol FROM Usuarios WHERE Email = '${email}'
      END ELSE BEGIN
          SELECT 'Usuario Inexistente' as Email
      END`);
    if (usuario.recordset[0].Email == "Usuario Inexistente") {
      return usuario.recordset[0];
    }
    if (usuario.recordset[0].Password == password) {
      return usuario.recordset[0];
    } else {
      usuario.recordset[0].Password = "Contraseña Inválida";
      return usuario.recordset[0];
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }
} */

const consultas = {
  EmbarqueDetalle: "select dbo.EmbarqueDetalle(reemplazar) as EmbarqueDetalle",
  ProductosCatalogo:
    "select dbo.ProductosCatalogo(default) as ProductosCatalogo",
  Embarques: "select dbo.Embarques(default) as Embarques",
  TableroControl: "select dbo.TableroControl(default) as TableroControl",
};
