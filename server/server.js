const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { type } = require("os");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const randomstring = require("randomstring");
const searchAndScrapeByExpNum = require("./webscraping/searchAndScrapeByExpNum");
const { error } = require("console");

dotenv.config();

const app = express();

// setting for stripe to work in production
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// conexion a base de datos

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);
  connection.release();
});

// ==================================================================================================== //
// ============================================ ROUTES ================================================ //
// ==================================================================================================== //

// ================== Usuario ================== //

// Login

app.post("/login", async (req, res) => {
  const { mail, password } = req.body.login;
  const deviceId = req.body.deviceId;
  db.query("SELECT * FROM users WHERE mail=?", [mail], async (err, result) => {
    if (err) {
      console.error("Error fetching user by mail: " + err);
    }
    if (result.length === 0) {
      res.json({ status: "userFail" });
    } else if (!result[0].verified_email) {
      res.json({ status: "emailNotVerified" });
    } else {
      const hashedPassword = await bcrypt.compare(password, result[0].password);
      if (hashedPassword) {
        db.query(
          "UPDATE users SET device_id=? WHERE mail=?",
          [deviceId, mail],
          async (err, response) => {
            if (err) {
              console.error("Error guardando device_id " + err);
            }
            if (response.affectedRows > 0) {
              const { password, device_id, ...user } = result[0];
              res.json({ ...user, device_id: deviceId, status: "success" });
            } else {
              res.json({ status: "deviceIdFail" });
            }
          }
        );
      } else {
        res.json({ status: "passwordFail" });
      }
    }
  });
});

// Verify device unique session

app.post("/deviceAuth", async (req, res) => {
  const userId = req.body.userId;
  const deviceId = req.body.deviceId;
  db.query("SELECT * FROM users WHERE id_user=?", [userId], (err, result) => {
    if (err) {
      console.error("Error encontrando usuario " + err);
    }
    if (result.length > 0) {
      if (result[0].device_id === deviceId) {
        const { password, ...user } = result[0];
        res.json({ status: "Success", user: user });
      } else {
        console.log("Auth Failed");
        res.json({ status: "Failed" });
      }
    }
  });
});

// Register

app.post("/register", async (req, res) => {
  const { name, lastname, mail, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query("SELECT mail FROM users WHERE mail=?", [mail], (err, result) => {
    if (err) {
      console.error("Error validating mail: " + err);
    }
    if (result.length == 0) {
      const token = randomstring.generate(60);
      db.query(
        "INSERT INTO users (name,lastname,password,mail,subscription,weekly_notification,monthly_notification,verified_email,device_id,email_verification_token) VALUES (?,?,?,?,?,'',true,true,false,'',?)",
        [name, lastname, hashedPassword, mail, token],
        (err, response) => {
          if (err) {
            console.error("Error en la insercion: " + err);
          }
          if (response.affectedRows > 0) {
            const source = fs
              .readFileSync("./email_templates/email_verification.html", "utf8")
              .toString();
            const template = handlebars.compile(source);
            const replacements = {
              mail: mail,
              link: process.env.CLIENT_URL + "/verifyEmail/" + token,
            };
            const htmlToSend = template(replacements);
            const transporter = nodemailer.createTransport({
              host: "smtp.zoho.com",
              secure: true,
              port: 465,
              auth: {
                user: process.env.NODEMAILER_EMAIL_ADDRESS,
                pass: process.env.NODEMAILER_EMAIL_PASSWORD,
              },
            });
            const mailOptions = {
              from: process.env.NODEMAILER_EMAIL_ADDRESS,
              to: mail,
              subject: "SUITPI - Verificación de correo",
              html: htmlToSend,
            };
            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("Error sending email: " + err.stack);
                return;
              }
              console.log("Email sent: " + info.response);
            });

            res.json({ status: "success" });
          }
        }
      );
    } else {
      res.json({ status: "email ya en uso" });
    }
  });
});

// Verify email

app.put("/verifyEmail", (req, res) => {
  const { token } = req.body;
  db.query(
    "UPDATE users SET verified_email=true, email_verification_token='' WHERE email_verification_token=?",
    [token],
    (err, result) => {
      if (err) {
        console.error("Error verifying email: " + err);
      }
      if (result.affectedRows > 0) {
        res.json({ status: "success" });
      } else {
        res.json({ status: "fail" });
      }
    }
  );
});

// Resend verification email

app.post("/resendToken", (req, res) => {
  const { email } = req.body;
  db.query(
    "SELECT email_verification_token FROM users WHERE mail=?",
    [email],
    (err, result) => {
      if (err) {
        console.error("Error fetching email verification token: " + err);
      }
      if (result.length > 0) {
        const token = result[0].email_verification_token;
        const source = fs
          .readFileSync("./email_templates/email_verification.html", "utf8")
          .toString();
        const template = handlebars.compile(source);
        const replacements = {
          mail: email,
          link: process.env.CLIENT_URL + "/verifyEmail/" + token,
        };
        const htmlToSend = template(replacements);
        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.com",
          secure: true,
          port: 465,
          auth: {
            user: process.env.NODEMAILER_EMAIL_ADDRESS,
            pass: process.env.NODEMAILER_EMAIL_PASSWORD,
          },
        });
        const mailOptions = {
          from: process.env.NODEMAILER_EMAIL_ADDRESS,
          to: email,
          subject: "SUITPI - Verificación de correo",
          html: htmlToSend,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending email: " + err.stack);
            return;
          }
          console.log("Email sent: " + info.response);
        });
        res.json({ status: "success" });
      }
    }
  );
});

// Envio de link para recuperar contraseña

app.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  db.query("SELECT * FROM users WHERE mail=?", [email], async (err, result) => {
    if (err) {
      console.error("Error fetching user by mail: " + err);
    }
    if (result.length === 0) {
      res.json({ status: "emailFail" });
    } else {
      const token = randomstring.generate(60);
      db.query(
        "UPDATE users SET reset_password_token=? WHERE mail=?",
        [token, email],
        (err, response) => {
          if (err) {
            console.error("Error updating reset password token: " + err);
          }
          if (response.affectedRows > 0) {
            const source = fs
              .readFileSync("./email_templates/password_recovery.html", "utf8")
              .toString();
            const template = handlebars.compile(source);
            const replacements = {
              mail: email,
              link: process.env.CLIENT_URL + "/resetPassword/" + token,
            };
            const htmlToSend = template(replacements);
            const transporter = nodemailer.createTransport({
              host: "smtp.zoho.com",
              secure: true,
              port: 465,
              auth: {
                user: process.env.NODEMAILER_EMAIL_ADDRESS,
                pass: process.env.NODEMAILER_EMAIL_PASSWORD,
              },
            });
            const mailOptions = {
              from: process.env.NODEMAILER_EMAIL_ADDRESS,
              to: email,
              subject: "SUITPI - Recuperación de contraseña",
              html: htmlToSend,
            };
            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("Error sending email: " + err.stack);
                return;
              }
              console.log("Email sent: " + info.response);
            });
            res.json({ status: "success" });
          }
        }
      );
    }
  });
});

// Reestablecer contraseña

app.post("/resetPassword", async (req, res) => {
  const { token, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    "SELECT * FROM users WHERE reset_password_token=?",
    [token],
    async (err, result) => {
      if (err) {
        console.error("Error fetching user by token: " + err);
      }
      if (result.length === 0) {
        res.json({ status: "tokenFail" });
      } else {
        db.query(
          "UPDATE users SET password=?, reset_password_token='' WHERE reset_password_token=?",
          [hashedPassword, token],
          (err, response) => {
            if (err) {
              console.error("Error updating password: " + err);
            }
            if (response.affectedRows > 0) {
              res.json({ status: "success" });
            }
          }
        );
      }
    }
  );
});

// Delete account

app.delete("/deleteAccount", (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  db.query("DELETE FROM users WHERE id_user=?", [userId], (err, result) => {
    if (err) {
      console.error("Error deleting account: " + err);
    }
    if (result.affectedRows > 0) {
      res.json({ status: "Account deleted" });
    }
  });
});

// update user info

app.put("/updateUserInfo", (req, res) => {
  const { name, lastname, phone } = req.body.updatedUser;
  const userId = req.body.userId;
  db.query(
    "UPDATE users SET name=?, lastname=?, phone=? WHERE id_user=?",
    [name, lastname, phone, userId],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar usuario: " + err);
      }
      if (result.affectedRows > 0) {
        db.query(
          "SELECT * FROM users WHERE id_user=?",
          [userId],
          (err, result) => {
            if (err) {
              console.error("Error fetching user data: " + err);
            }
            if (result.length > 0) {
              console.log(result[0]);
              const { password, ...user } = result[0];
              res.status(200).json(user);
              console.log(user);
            }
          }
        );
      }
    }
  );
});

// update weekly notification

app.put("/updateWeeklyNotification", (req, res) => {
  const { userId, weekly_notification } = req.body;
  db.query(
    "UPDATE users SET weekly_notification=? WHERE id_user=?",
    [weekly_notification, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating weekly notification: " + err);
      }
      if (result.affectedRows > 0) {
        res.json({ status: "success" });
      }
    }
  );
});

// update monthly notification

app.put("/updateMonthlyNotification", (req, res) => {
  const { userId, monthly_notification } = req.body;
  db.query(
    "UPDATE users SET monthly_notification=? WHERE id_user=?",
    [monthly_notification, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating monthly notification: " + err);
      }
      if (result.affectedRows > 0) {
        res.json({ status: "success" });
      }
    }
  );
});

// ================== Clientes ================== //

// Add new client

app.post("/addClient", (req, res) => {
  const { name, email, phone, rfc, address, userId } = req.body;
  db.query(
    "INSERT INTO clients (name, mail, phone, rfc, address, id_user) VALUES (?,?,?,?,?,?)",
    [name, email, phone, rfc, address, userId],
    (err, result) => {
      if (err) {
        console.error("Error executing the query: " + err.stack);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 1) {
        db.query(
          "SELECT * FROM clients WHERE id_user=?",
          [userId],
          (err, result) => {
            if (err) {
              console.error("Error executing the query: " + err.stack);
              return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json(result);
          }
        );
      } else {
        res.json({ status: "error" });
      }
    }
  );
});

// edit client info

app.put("/updateClientInfo", (req, res) => {
  const { name, id_client, mail, phone, address, rfc } = req.body;
  db.query(
    "UPDATE clients SET name=?, mail=?, phone=?, rfc=?, address=? WHERE id_client=?",
    [name, mail, phone, rfc, address, id_client],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar informacion del cliente " + err);
      }
      if (result.affectedRows > 0) {
        res.status(200).json(result);
      } else {
        res.json({ status: "error" });
      }
    }
  );
});

// Get clients by user ID

app.post("/getClients", (req, res) => {
  const { userId } = req.body;
  db.query("SELECT * FROM clients WHERE id_user=?", [userId], (err, result) => {
    if (err) {
      console.error("Error executing the query: " + err.stack);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

// Delete client by ID

app.delete("/deleteClient", (req, res) => {
  const { id_client } = req.body;
  db.query(
    "DELETE FROM clients WHERE id_client=?",
    [id_client],
    (err, result) => {
      if (err) {
        console.error("Error deleting client: " + err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json({ status: "Client deleted" });
      }
    }
  );
});

// get all user data

app.post("/getUserData", async (req, res) => {
  const { userId } = req.body;

  const getClients = new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM clients WHERE id_user=?",
      [userId],
      (err, result) => {
        if (err) {
          console.error("Error fetching user data: " + err);
          reject({ error: "Error al obtener clientes" });
        }
        if (result.length > 0) {
          resolve(result);
        } else {
          resolve([]);
        }
      }
    );
  });

  const getMarcas = new Promise((resolve, reject) => {
    db.query(
      "SELECT id_marca,numExp,denom,numReg,fechaCon,fechaVig,titNom,clase,status,id_user,id_client,fechaDenegacion,usoDec,fechaDenegacionProv FROM marcas WHERE id_user=?",
      [userId],
      (err, result) => {
        if (err) {
          console.error("Error fetching user data: " + err);
          reject({ error: "Error al obtener marcas" });
        }
        if (result.length > 0) {
          resolve(result);
        } else {
          resolve([]);
        }
      }
    );
  });

  Promise.all([getClients, getMarcas])
    .then(([clientes, marcas]) => {
      res.status(200).json({ clientes, marcas });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// ================== Marcas ================== //

// Get marcas by user ID

app.post("/getUserMarcas", (req, res) => {
  const userId = req.body.userId;
  db.query("SELECT * FROM marcas WHERE id_user=?", [userId], (err, result) => {
    if (err) {
      console.error("Error executing the query: " + err.stack);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});

// Get marcas and user info by client ID

app.get("/clientById", (req, res) => {
  const clientId = parseInt(req.query.id);
  const marcasQuery = "SELECT * FROM marcas WHERE id_client = ?";
  const clientInfoQuery = "SELECT * FROM clients WHERE id_client = ?";

  db.query(marcasQuery, [clientId], (err, marcasResult) => {
    if (err) {
      console.error("Error in marcas query: " + err);
      return res.status(500).json({ error: "Error in marcas query" });
    }

    db.query(clientInfoQuery, [clientId], (err, clientInfoResult) => {
      if (err) {
        console.error("Error in user info query: " + err);
        return res.status(500).json({ error: "Error in client info query" });
      }
      res.json({ marcas: marcasResult, clientInfo: clientInfoResult[0] });
    });
  });
});

// Agregar marca

app.post("/agregarMarca", async (req, res) => {
  const num = req.body.num;
  const id_client = req.body.id_client;
  const id_user = req.body.id_user;
  const type = req.body.type;
  const userSub = () =>
    new Promise((resolve, reject) => {
      db.query(
        "SELECT subscription FROM users WHERE id_user=?",
        [id_user],
        (err, result) => {
          if (err) {
            console.error("Error fetching user subscription: " + err);
            reject(err);
          } else {
            resolve(result[0].subscription);
          }
        }
      );
    });

  const userTotalMarcas = () =>
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) FROM marcas WHERE id_user=?",
        [id_user],
        (err, result) => {
          if (err) {
            console.error("Error fetching user total marcas: " + err);
            reject(err);
          } else {
            resolve(result[0]["COUNT(*)"]);
          }
        }
      );
    });

  const limitMet = (userSub, userTotalMarcas) => {
    switch (userSub) {
      case "Basico":
        return userTotalMarcas >= 200;
      case "Intermedio":
        return userTotalMarcas >= 1000;
      case "Profesional":
        return userTotalMarcas >= 5000;
      case "Empresarial":
        return userTotalMarcas >= 10000;
      default:
        return false;
    }
  };
  try {
    const sub = await userSub();
    const totalMarcas = await userTotalMarcas();
    if (limitMet(sub, totalMarcas)) {
      res.status(205).json({ status: "Limite de marcas alcanzado" });
    } else {
      const marca = await searchAndScrapeByExpNum(num, type);
      if (marca === "multiples registros") {
        res.status(206).json({ status: "multiples registros" });
        return;
      } else if (marca) {
        db.query(
          "INSERT INTO marcas (numExp,numReg,fechaPres,fechaUso,fechaCon,fechaVig,fechaPub,denom,descMar,tipoSol,tipoMarca,leyendas,regInt,imagen,titNom,titDir,titPob,titCP,titPais,titNac,titRFC,titTel,titFax,titEmail,clase,descClase,status,fechaDenegacion,fechaDenegacionProv,usoDec,id_user,id_client) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            marca.numExp,
            marca.numReg,
            marca.fechaPres,
            marca.fechaUso,
            marca.fechaCon,
            marca.fechaVig,
            marca.fechaPub,
            marca.denom,
            marca.descMar,
            marca.tipoSol,
            marca.tipoMarca,
            marca.leyendas,
            marca.regInt,
            marca.imagen,
            marca.titNom,
            marca.titDir,
            marca.titPob,
            marca.titCP,
            marca.titPais,
            marca.titNac,
            marca.titRFC,
            marca.titTel,
            marca.titFax,
            marca.titEmail,
            marca.clase,
            marca.descClase,
            marca.status,
            marca.fechaDenegacion,
            marca.fechaDenegacionProv,
            marca.usoDec,
            id_user,
            id_client,
          ],
          (err, result) => {
            if (err) {
              console.error("Error executing the query: " + err.stack);
              return res.status(500).json({ error: "Database error" });
            }
            if (result.affectedRows === 1) {
              switch (type) {
                case "expediente":
                  db.query(
                    "SELECT * FROM marcas WHERE numExp=? AND id_client=?",
                    [num, id_client],
                    (err, result) => {
                      if (err) {
                        console.error(
                          "Error executing the query: " + err.stack
                        );
                        return res
                          .status(500)
                          .json({ error: "Database error" });
                      }
                      res.status(200).json(result);
                    }
                  );
                  break;
                case "registro":
                  db.query(
                    "SELECT * FROM marcas WHERE numReg=? AND id_client=?",
                    [num, id_client],
                    (err, result) => {
                      if (err) {
                        console.error(
                          "Error executing the query: " + err.stack
                        );
                        return res
                          .status(500)
                          .json({ error: "Database error" });
                      }
                      res.status(200).json(result);
                    }
                  );
                  break;
                default:
                  break;
              }
            }
          }
        );
      } else {
        res.status(500).json({error: "Error buscando marca"});
      }
    }
  } catch (error) {
    console.error("Error adding marca: " + error);
  }
});

// Delete marca

app.delete("/deleteMarca", (req, res) => {
  const { marcaId } = req.body;
  db.query("DELETE FROM marcas WHERE id_marca=?", [marcaId], (err, result) => {
    if (err) {
      console.error("Error deleting marca: " + err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ status: "Marca deleted" });
    }
  });
});

// Update marca

app.put("/updateMarca", async (req, res) => {
  const { marcaId, numExp, numReg } = req.body;
  let marca = await searchAndScrapeByExpNum(numExp, "expediente");
  if (marca === "multiples registros") {
    console.log("Multiples registros");
    marca = await searchAndScrapeByExpNum(numReg, "registro");
  }
if (marca) {
  db.query(
    "UPDATE marcas SET fechaUso=?,fechaCon=?,fechaVig=?,fechaPub=?,descMar=?,tipoSol=?,tipoMarca=?,leyendas=?,regInt=?,imagen=?,titNom=?,titDir=?,titPob=?,titCP=?,titPais=?,titNac=?,titRFC=?,titTel=?,titFax=?,titEmail=?,status=?,fechaDenegacion=?,fechaDenegacionProv=?,usoDec=? WHERE id_marca=?",
    [
      marca.fechaUso,
      marca.fechaCon,
      marca.fechaVig,
      marca.fechaPub,
      marca.descMar,
      marca.tipoSol,
      marca.tipoMarca,
      marca.leyendas,
      marca.regInt,
      marca.imagen,
      marca.titNom,
      marca.titDir,
      marca.titPob,
      marca.titCP,
      marca.titPais,
      marca.titNac,
      marca.titRFC,
      marca.titTel,
      marca.titFax,
      marca.titEmail,
      marca.status,
      marca.fechaDenegacion,
      marca.fechaDenegacionProv,
      marca.usoDec,
      marcaId,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating marca: " + err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json({ status: "Marca updated", marca: marca });
      } else if (result.affectedRows === 0) {
        res
          .status(501)
          .json({ error: "Error extrayendo informacion de marca" });
      }
    }
  );
} else {
  res.status(501).json({ error: "Error extrayendo informacion de marca" });
}
});

// =============== Notificaciones =============//

// Get notifications by user ID

app.post("/getNotifications", (req, res) => {
  const { userId } = req.body;
  db.query(
    "SELECT * FROM notifications WHERE id_user=?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error fetching notifications: " + err);
        return res.status(500).json({ error: "Database error" });
      } else if (result.length === 0) {
        return res.json({ status: "No notifications" });
      } else if (result.length > 0) {
        return res.json({ status: "success", notifications: result });
      } else {
        return res.json({ status: "error" });
      }
    }
  );
});

// Get unread notifications

app.post("/getUnreadNotifications", (req, res) => {
  const { userId } = req.body;
  db.query(
    "SELECT * FROM notifications WHERE id_user=? AND isRead=0",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error fetching notifications: " + err);
        return res.status(500).json({ error: "Database error" });
      } else if (result.length === 0) {
        return res.json({ status: "No notifications" });
      } else if (result.length > 0) {
        return res.json({ status: "success", notifications: result });
      } else {
        return res.json({ status: "error" });
      }
    }
  );
});

// Mark notification as read

app.put("/markAsRead", (req, res) => {
  const { id_notification } = req.body;
  db.query(
    "UPDATE notifications SET isRead=true WHERE id_notification=?",
    [id_notification],
    (err, result) => {
      if (err) {
        console.error("Error updating notification: " + err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows > 0) {
        res.status(200).json({ status: "success" });
      }
    }
  );
});

// ===================================================================================================================== //
// ================================================== Pasarelas de Pago ================================================ //
// ===================================================================================================================== //

// ================== STRIPE ================== //

// Create a checkout session

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const { userId, plan } = req.body;
  const session = await stripe.checkout.sessions.create({
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    locale: "es",
    line_items: [
      {
        price: plan.id,
        quantity: 1,
        tax_rates: [process.env.STRIPE_TAX_RATE_IVA],
      },
    ],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 15,
    },
  });
  const sessionId = session.id;
  db.query(
    "UPDATE users SET stripe_session_id=? WHERE id_user=?",
    [sessionId, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating stripe session id: " + err);
        return res.status(500).json({ error: "Failed to create session" });
      }
      if (result.affectedRows > 0) {
        res.json({ sessionUrl: session.url, sessionId: sessionId });
      }
    }
  );
});

// Verify Stripe session

app.get("/success", async (req, res) => {
  const sessionId = req.query.session_id;
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  const customer = await stripe.customers.retrieve(session.customer);
  let subscriptionTitle = "";
  await new Promise((resolve, reject) => {
    console.log("PriceId"+session.line_items.data[0].price.id);
    switch (session.line_items.data[0].price.id) {
      case process.env.STRIPE_SUBSCRIPTION_PROFESIONAL:
        subscriptionTitle = "Profesional";
        resolve();
        break;
      case process.env.STRIPE_SUBSCRIPTION_INTERMEDIO:
        subscriptionTitle = "Intermedio";
        resolve();
        break;
      case process.env.STRIPE_SUBSCRIPTION_BASICO:
        subscriptionTitle = "Basico";
        resolve();
        break;
      case process.env.STRIPE_SUBSCRIPTION_EMPRESARIAL:
        subscriptionTitle = "Empresarial";
        resolve();
        break;
      default:
        reject(new Error("Invalid subscription plan"));
        break;
    }
  }).then(() => {
    if (session.status === "complete") {
      db.query(
        "UPDATE users SET stripe_subscription_id=?, subscription_status='active', subscription=?, stripe_customer_id=? WHERE stripe_session_id=?",
        [session.subscription, subscriptionTitle, customer.id, sessionId],
        (err, result) => {
          if (err) {
            console.error("Error updating subscription id: " + err);
          }
        }
      );
      res.json({
        customer: customer,
        session: session,
        subscription: subscriptionTitle,
      });
    }
  });
});

// Cambiar plan de suscripcion

app.put("/update-subscription", async (req, res) => {
  const { subscriptionId, plan } = req.body;
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId); 
    const subscriptionItemId = subscription.items.data[0].id
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: subscriptionItemId,
            price: plan.id,
          },
        ],
        proration_behavior: 'create_prorations',
        cancel_at_period_end: false,
      }
    );
    if (updatedSubscription) {
      db.query(
        "UPDATE users SET stripe_subscription_id=?, subscription=? WHERE stripe_subscription_id=?",
        [updatedSubscription.id, plan.title, subscriptionId],
        (err, result) => {
          if (err) {
            console.error("Error updating subscription status: " + err);
          }
        }
      );
      res.json({ status: "success", subscription: updatedSubscription });
    } else {
      res.json({ status: "error" });
    }
  } catch (error) {
    console.error("Error updating subscription: " + error);
    res.json({ status: "error", error: error });
  }
});

// Cancelar suscripcion

app.put("/cancel-subscription", async (req, res) => {
  const { subscriptionId } = req.body.data;
  const canceledSubscription = await stripe.subscriptions.cancel(
    subscriptionId
  );
  if (canceledSubscription) {
    db.query(
      "UPDATE users SET subscription_status='canceled', subscription='' WHERE stripe_subscription_id=?",
      [subscriptionId],
      (err, result) => {
        if (err) {
          console.error("Error updating subscription status: " + err);
        }
      }
    );
    res.json({ status: "success" });
  } else {
    res.json({ status: "error" });
  }
});

// Webhooks de Stripe

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      console.log(req);
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    let subscriptionTitle = "";
    switch (event.type) {
      case "charge.expired":
        const chargeExpired = event.data.object;
        db.query(
          "UPDATE users SET subscription_status='expired' WHERE stripe_subscription_id=?",
          [chargeExpired.id],
          (err, result) => {
            if (err) {
              console.error("Error updating subscription status: " + err);
            }
          }
        );
        break;

      case "charge.expired":
        const chargeFailed = event.data.object;
        db.query(
          "UPDATE users SET subscription_status='expired' WHERE stripe_subscription_id=?",
          [chargeFailed.id],
          (err, result) => {
            if (err) {
              console.error("Error updating subscription status: " + err);
            }
          }
        );
        break;

      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        break;

      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        new Promise((resolve, reject) => {
          switch (checkoutSessionCompleted.amount_total) {
            case 49900:
              subscriptionTitle = "Basico";
              resolve();
              break;
            case 79900:
              subscriptionTitle = "Intermedio";
              resolve();
              break;
            case 149900:
              subscriptionTitle = "Profesional";
              resolve();
              break;
            case 199900:
              subscriptionTitle = "Empresarial";
              resolve();
              break;
            default:
              reject(console.error("Error updating subscription status"));
              break;
          }
        }).then(() => {
          db.query(
            "UPDATE users SET stripe_subscription_id=?, subscription_status='active', subscription=? WHERE stripe_session_id=?",
            [
              checkoutSessionCompleted.subscription,
              subscriptionTitle,
              checkoutSessionCompleted.id,
            ],
            (err, result) => {
              if (err) {
                console.error("Error updating subscription id: " + err);
              }
            }
          );
        });
        break;

      case "customer.subscription.deleted":
        const subscriptionDeleted = event.data.object;
        db.query(
          "UPDATE users SET subscription_status='canceled', subscription='' WHERE stripe_subscription_id=?",
          [subscriptionDeleted.id],
          (err, result) => {
            if (err) {
              console.error("Error updating subscription status: " + err);
            }
          }
        );
      default:
    }
    res.status(200).json({ success: true });
  }
);

// ================== Start the server ================== //

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server running");
});
