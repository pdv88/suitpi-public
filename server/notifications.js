const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mysql = require("mysql");
const handlebars = require("handlebars");
const fs = require("fs");
const scrapeNotifications = require("./webscraping/scrapeNotifications.js");
const searchAndScrapeByExpNum = require("./webscraping/searchAndScrapeByExpNum");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.SERVER_URL;

// Load environment variables
require("dotenv").config();

// database connection

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

// update database

const updateDatabase = (notifications) => {
  return new Promise((resolve, reject) => {
    const promises = notifications.map(async (notification) => {
      try {
        let marca = await searchAndScrapeByExpNum(notification.numExp, "expediente");

        if (marca === "multiples registros") {
          console.log("Multiples registros");
          marca = await searchAndScrapeByExpNum(notification.numReg, "registro");
        }

        return new Promise((resolve, reject) => {
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
      } catch (error) {
        reject(error);
      }
    });

    Promise.all(promises)
      .then(() => {
        resolve("All marcas updated successfully");
      })
      .catch((error) => {
        reject(error);
      });
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

// scrapeNotifications();

(async () => {
  const rawNotifications = await scrapeNotifications;

  // removes duplicates
  const notifications = await rawNotifications.filter(
    (notification, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.numExp === notification.numExp &&
          t.numReg === notification.numReg &&
          t.serExp === notification.serExp &&
          t.descOficio === notification.descOficio &&
          t.numOficio === notification.numOficio &&
          t.fechaGaceta === notification.fechaGaceta &&
          t.fechaOficio === notification.fechaOficio
      )
  );

  console.log(notifications.length + " notifications found");

  db.query("SELECT * FROM marcas", (err, results) => {
    if (err) {
      console.error("Error fetching marcas: " + err);
      return;
    }
    if (results.length > 0) {
      console.log(results.length + " marcas found");
      const filteredNotifications = notifications.filter((notification) => {
        return results.some((marca) => marca.numExp === notification.numExp);
      });

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
      const notificationsToSend = filteredNotifications.flatMap((notification) => {
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
      });
      console.log(filteredNotifications.length + " filtered notifications");
      console.log(notificationsToInsert);

      if (notificationsToInsert.length > 0) {
        db.query(
          "INSERT INTO notifications (num, numExp, numReg, serExp, descOficio, numOficio, fechaOficio, fechaGaceta, urlOficio, id_user, id_client, id_marca, isRead) VALUES ?",
          [notificationsToInsert],
          async(err, results) => {
            if (err) {
              console.error("Error inserting notifications: " + err);
              return;
            }
            console.log(results.affectedRows + " notifications inserted");
            await Promise.all([
              updateDatabase(filteredNotifications),
              sendNotificationEmail(notificationsToSend)]
            ).then(() => {
              console.log("Notifications updated and email sent");
              db.end();
              process.exit();
            }).catch((error) => {
              console.error("Error: " + error);
            })

          }
        );
      } else {
        console.log("No new notifications found");
        db.end();
        process.exit();
      }
    }
  });
})();

