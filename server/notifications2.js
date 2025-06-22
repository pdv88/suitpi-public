const fs = require("fs");
const parseString = require("xml2js").parseString;
const searchAndScrapeByExpNum = require("./webscraping/searchAndScrapeByExpNum");
const handlebars = require("handlebars");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

// database connection local
// const db = mysql.createPool({
//   connectionLimit: 10,
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// database connection remote
const db = mysql.createPool({
  // connectionLimit: 10,
  host: process.env.DB_HOST_RAILWAY,
  user: process.env.DB_USER_RAILWAY,
  password: process.env.DB_PASSWORD_RAILWAY,
  database: process.env.DB_NAME_RAILWAY,
  port: process.env.DB_PORT_RAILWAY,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);
  connection.release();
});

// update database

const updateDatabase = (notifications) => {
  let marcasNoActualizadas = [];
  return new Promise((resolve, reject) => {
    (async () => {
      for (const notification of notifications) {
        try {

          let marca;
          let intentos = 0;

          while (!marca && intentos < 3) {
            console.log("Intento " + (intentos+1) + " para " + notification.numExp);
            try {
            marca = await searchAndScrapeByExpNum(
              notification.numExp,
              "expediente"
            );

            if (marca === "multiples registros") {
              console.log("Multiples registros");
              marca = await searchAndScrapeByExpNum(
                notification.numReg,
                "registro"
              );
            }
            intentos++;
          } catch (error) {
            console.log(error);
            marca = "";
          }
        }
        
          
          if (!marca) {
            console.log(
              "Error al actualizar la marca con expediente " +
                notification.numExp
            );
            marcasNoActualizadas.push(notification.numExp);
          } else {
            await new Promise((resolve, reject) => {
              db.query(
                "UPDATE marcas SET fechaUso=?,fechaCon=?,fechaVig=?,fechaPub=?,descMar=?,tipoSol=?,tipoMarca=?,leyendas=?,regInt=?,imagen=?,titNom=?,titDir=?,titPob=?,titCP=?,titPais=?,titNac=?,titRFC=?,titTel=?,titFax=?,titEmail=?,status=?,fechaDenegacion=?,fechaDenegacionProv=?,usoDec=? WHERE numExp=?",
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
                  notification.numExp,
                ],
                (err, result) => {
                  if (err) {
                    console.log("Error updating marca: " + notification.numExp);
                    reject(err);
                  }
                  if (result.affectedRows > 0) {
                    resolve("Marca updated successfully");
                  } else {
                    reject("Error updating marca");
                  }
                }
              );
            });
          }

        } catch (error) {
          reject(error);
        }
      }
    })()
      .then(() => {
        console.log("marcas no actualizadas: " + marcasNoActualizadas);
        resolve("All marcas updated successfully");
      })
      .catch((error) => {
        reject(error);
      });
  });

  Promise.all(promises)
    .then(() => {

      resolve("All marcas updated successfully");
    })
    .catch((error) => {
      reject(error);
    });
};

// funcion send notification email

const sendNotificationEmail = (notifications) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      if (results.length > 0) {
        let promises = [];
        results.forEach((user) => {
          const userNotifications = notifications.filter(
            (notification) => notification.id_user === user.id_user
          );
          if (userNotifications.length > 0) {
            promises.push(
              new Promise((resolve, reject) => {
                const transporter = nodemailer.createTransport({
                  host: "smtp.zoho.com",
                  // secure: true,
                  port: 465,
                  auth: {
                    user: process.env.NODEMAILER_EMAIL_ADDRESS,
                    pass: process.env.NODEMAILER_EMAIL_PASSWORD,
                  },
                  tls: {
                    rejectUnauthorized: false, // Disable SSL verification
                  },
                });
                const source = fs
                  .readFileSync("./email_templates/notification.html", "utf8")
                  .toString();
                const template = handlebars.compile(source);
                const replacements = {
                  notifications: userNotifications,
                  user: user.name,
                };
                const htmlToSend = template(replacements);
                const mailOptions = {
                  from: process.env.NODEMAILER_EMAIL_ADDRESS,
                  to: user.mail,
                  subject: "SuitPI - Actualizaciones en tus marcas",
                  html: htmlToSend,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(info.response);
                  }
                });
              })
            );
          }
        });

        Promise.all(promises)
          .then((responses) => {
            resolve(responses.join("\n"));
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve("No users found");
      }
    });
  });
};

// inset notifications to database

const insertNotificationsDB = (notifications) => {
  db.query(
    "INSERT INTO notifications (num, numExp, numReg, serExp, descOficio, numOficio, fechaOficio, fechaGaceta, urlOficio, id_user, id_client, id_marca, isRead) VALUES ?",
    [notifications],
    async (err, results) => {
      if (err) {
        console.error("Error inserting notifications: " + err);
        return;
      }
      console.log(results.affectedRows + " notifications inserted");
    }
  );
};

// parse date

const parseDate = (dateString) => {
  const parts = dateString.split("/"); // Assuming format is DD/MM/YYYY
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }
  return null; // Handle invalid date format
};

//-------------------------MAIN FUNCTION-------------------------//

(async () => {
  let rawNotifications = [];
  let promises = [];

  const readXMLFile = (fileName) => {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, "utf-8", (err, data) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve("");
          } else {
            reject(err);
          }
        } else {
          parseString(data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              const ejemplar = result.ejemplar;
              const seccion = ejemplar.seccion.find(
                (s) => s.$.nombre === "Notificaciones de Marcas"
              );
              seccion.ficha.forEach((element) => {
                let notificacion = {
                  num: rawNotifications.length + 1,
                  numExp: (element.campo.find((e) => e.clave[0] === "Expediente") || { valor: [""] }).valor[0] || "",
                  numReg: (element.campo.find((e) => e.clave[0] === "Registro de Marca") || { valor: [""] }).valor[0] || "",
                  serExp: (element.campo.find((e) => e.clave[0] === "Serie del expediente") || { valor: [""] }).valor[0] || "",
                  descOficio: (element.campo.find((e) => e.clave[0] === "Descripción del oficio") || { valor: [""] }).valor[0] || "",
                  numOficio: (element.campo.find((e) => e.clave[0] === "Número del oficio") || { valor: [""] }).valor[0] || "",
                  fechaOficio: parseDate((element.campo.find((e) => e.clave[0] === "Fecha del oficio") || { valor: [""] }).valor[0] || ""),
                  urlOficio: (element.campo.find((e) => e.clave[0] === "Enlace electrónico") || { valor: [""] }).valor[0] || "",
                  fechaGaceta: new Date(),
                };
                rawNotifications.push(notificacion);
              });
              resolve();
            }
          });
        }
      });
    });
  };

  promises.push(readXMLFile("gaceta.xml"));
  promises.push(
    fs.existsSync("gaceta2.xml")
      ? readXMLFile("gaceta2.xml")
      : Promise.resolve()
  );

  Promise.all(promises).then(() => {
    console.log(rawNotifications.length + " notifications found");
    console.log(rawNotifications[0]);

    db.query(
      "SELECT id_user,id_client,numExp,id_marca FROM marcas",
      (err, results) => {
        if (err) {
          console.error("Error fetching marcas: " + err);
          return;
        }
        if (results.length > 0) {
          console.log(results.length + " marcas found");

          const filteredNotifications = rawNotifications.filter(
            (notification) => {
              return results.some(
                (marca) => marca.numExp === notification.numExp
              );
            }
          );

          const notificationsToInsert = filteredNotifications.flatMap(
            (notification) => {
              const matchingMarcas = results.filter(
                (marca) => marca.numExp === notification.numExp
              );
              return matchingMarcas.map((matchingMarca) => {
                return [
                  notification.num,
                  notification.numExp,
                  notification.numReg,
                  notification.serExp,
                  notification.descOficio,
                  notification.numOficio,
                  notification.fechaOficio,
                  notification.fechaGaceta,
                  notification.urlOficio,
                  matchingMarca.id_user,
                  matchingMarca.id_client,
                  matchingMarca.id_marca,
                  false,
                ];
              });
            }
          );

          const notificationsToSend = filteredNotifications.flatMap(
            (notification) => {
              const matchingMarcas = results.filter(
                (marca) => marca.numExp === notification.numExp
              );
              return matchingMarcas.map((matchingMarca) => {
                return {
                  num: notification.num,
                  numExp: notification.numExp,
                  numReg: notification.numReg,
                  serExp: notification.serExp,
                  descOficio: notification.descOficio,
                  numOficio: notification.numOficio,
                  fechaOficio: notification.fechaOficio,
                  fechaGaceta: notification.fechaGaceta,
                  urlOficio: notification.urlOficio,
                  id_user: matchingMarca.id_user,
                  id_client: matchingMarca.id_client,
                  id_marca: matchingMarca.id_marca,
                  isRead: false,
                };
              });
            }
          );

          console.log(filteredNotifications.length + " filtered notifications");
          console.log(notificationsToInsert);

          if (notificationsToInsert.length > 0) {

                Promise.all([
                  insertNotificationsDB(notificationsToInsert),
                  sendNotificationEmail(notificationsToSend),
                  updateDatabase(filteredNotifications),
                ])
                  .then(() => {
                    console.log("Notifications updated and email sent");
                    db.end();
                    process.exit();
                  })
                  .catch((error) => {
                    console.error("Error: " + error);
                  });
          } else {
            console.log("No new notifications found");
            db.end();
            process.exit();
          }
        }
      }
    );
  });
})();
