const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const handlebars = require("handlebars");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

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

function getNaturalDays(businessDays) {
  let naturalDays = 0;
  let date = new Date(); // Initialize date outside the loop
  while (businessDays > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      // Check if it's not a weekend
      businessDays--;
    }
    naturalDays++;
  }
  return naturalDays;
}

// Function to send email



const promises = [];
db.query("SELECT * FROM users", (err, result) => {
  if (err) {
    console.error("Error getting users: " + err.stack);
    return;
  }
  result.forEach((user) => {
    if (user.weekly_notification) {
      promises.push(
        new Promise((resolve, reject) => {
          db.query(
            "SELECT * FROM marcas WHERE id_user = ?",
            [user.id_user],
            (err, result) => {
              if (err) {
                console.error("Error getting marcas: " + err.stack);
                reject(err);
                return;
              }
              console.log("Marcas fetched successfully");
              if (result.length > 0) {
                let marcasExpiran = [];
                let marcasSinUso = [];
                let marcasImpugnarNegativa = [];
                let marcasResponderImpugnacion = [];
                result.forEach((marca) => {
                  // filter brands that fechaVig deadline is in the next 7 days
                  if (marca.fechaVig) {
                    if (
                      new Date(marca.fechaVig) <
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                      new Date(marca.fechaVig) > new Date(Date.now())
                    ) {
                      const fechaVig = new Date(marca.fechaVig);
                      const day = fechaVig.getDate();
                      const month = fechaVig.getMonth() + 1;
                      const year = fechaVig.getFullYear();
                      const date = `${day}/${month}/${year}`;
                      marcasExpiran.push({
                        numExp: marca.numExp,
                        denom: marca.denom == "" ? "Sin Denominación" : marca.denom,
                        date: date,
                      });
                    }
                  }

                  // filter brands that fechaUso deadline is in the next 7 days
                  if (marca.fechaCon && marca.usoDec === "no declarado") {
                    const plazoUso = new Date(marca.fechaCon);
                    plazoUso.setFullYear(plazoUso.getFullYear() + 3);
                    if (
                      plazoUso < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                      plazoUso > new Date(Date.now())
                    ) {
                      const day = plazoUso.getDate();
                      const month = plazoUso.getMonth() + 1;
                      const year = plazoUso.getFullYear();
                      const date = `${day}/${month}/${year}`;
                      marcasSinUso.push({
                        numExp: marca.numExp,
                        denom: marca.denom,
                        date: date,
                      });
                    }
                  }

                  // filter brands that fechaDenegacion deadline is in the next 7 days
                  if (marca.fechaDenegacion) {
                    const fechaDenegacion = new Date(marca.fechaDenegacion);
                    const naturalDaysToAdd = getNaturalDays(30);
                    const deadlineDate = new Date(
                      fechaDenegacion.getTime() +
                        naturalDaysToAdd * 24 * 60 * 60 * 1000
                    );
                    const today = new Date();
                    const next7days = new Date(
                      today.getTime() + 7 * 24 * 60 * 60 * 1000
                    );

                    if (deadlineDate >= today && deadlineDate < next7days) {
                      console.log("Deadline date fecha denegacion: " + deadlineDate);
                      const day = deadlineDate.getDate();
                      const month = deadlineDate.getMonth() + 1;
                      const year = deadlineDate.getFullYear();
                      const formattedDate = `${day}/${month}/${year}`;
                      marcasImpugnarNegativa.push({
                        numExp: marca.numExp,
                        denom: marca.denom,
                        date: formattedDate,
                      });
                    }
                  }

                  // filter brands that fechaDenegacionProv deadline is in the next 7 days
                  if (marca.fechaDenegacionProv) {
                    const deadlineDate = new Date(marca.fechaDenegacionProv);
                    deadlineDate.setMonth(deadlineDate.getMonth() + 2);
                    const today = new Date();
                    const next7days = new Date(
                      today.getTime() + 7 * 24 * 60 * 60 * 1000
                    );


                    if (deadlineDate >= today && deadlineDate < next7days) {
                      const day = deadlineDate.getDate();
                      const month = deadlineDate.getMonth() + 1;
                      const year = deadlineDate.getFullYear();
                      const date = `${day}/${month}/${year}`;
                      marcasResponderImpugnacion.push({
                        numExp: marca.numExp,
                        denom: marca.denom,
                        date: date,
                      });
                    }
                  }

                });
                // sort by date
                marcasExpiran = marcasExpiran.sort((a, b) => new Date(a.date) - new Date(b.date));
                marcasSinUso = marcasSinUso.sort((a, b) => new Date(a.date) - new Date(b.date));
                marcasImpugnarNegativa = marcasImpugnarNegativa.sort(
                  (a, b) => new Date(a.date) - new Date(b.date)
                );
                marcasResponderImpugnacion = marcasResponderImpugnacion.sort(
                  (a, b) => new Date(a.date) - new Date(b.date)
                );

                if (
                  marcasExpiran.length ||
                  marcasSinUso.length ||
                  marcasImpugnarNegativa.length ||
                  marcasResponderImpugnacion.length
                ) {
                  console.log("Sending email to: " + user.name + " " + marcasExpiran + " " + marcasSinUso + " " + marcasImpugnarNegativa + " " + marcasResponderImpugnacion);
                  const source = fs
                    .readFileSync("./email_templates/week_report.html", "utf8")
                    .toString();

                  const template = handlebars.compile(source);
                  const replacements = {
                    marcasExpiran: marcasExpiran,
                    marcasSinUso: marcasSinUso,
                    marcasImpugnarNegativa: marcasImpugnarNegativa,
                    marcasResponderImpugnacion: marcasResponderImpugnacion,
                    user: user.name,
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
                    tls: {
                      rejectUnauthorized: false, // Disable SSL verification
                    },
                  });
                  const mailOptions = {
                    from: process.env.NODEMAILER_EMAIL_ADDRESS,
                    to: user.mail,
                    subject: "SuitPI - Informe Semanal",
                    html: htmlToSend,
                  };
                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.error("Error sending email: " + err.stack);
                      reject(err);
                      return;
                    }
                    console.log("Email sent: " + info.response);
                    resolve(info.response);
                  });
                } else {
                  resolve("No expiraciones o vencimientos encontrados");
                }
              } else {
                resolve("Usuario no tiene marcas");
              }
            }
          );
        })
      );
    } else {
      resolve("Usuario no quiere informa semanal");
    }
  });

  Promise.all(promises)
    .then((results) => {
      console.log("All promises resolved: " + results);
      db.end();
      process.exit();
    })
    .catch((err) => {
      console.error("Error resolving promises: " + err);
      db.end();
      process.exit();
    });
  })



