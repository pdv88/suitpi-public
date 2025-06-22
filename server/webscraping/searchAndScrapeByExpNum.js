const puppeteer = require("puppeteer-extra");
const puppeteerPluginStealth = require("puppeteer-extra-plugin-stealth");
const proxyChain = require("proxy-chain");
const dotenv = require("dotenv");
const portfinder = require("portfinder");

dotenv.config();
puppeteer.use(puppeteerPluginStealth());

const getAvailablePort = async () => {
  return await portfinder.getPortPromise();
};

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36",
];
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function searchAndScrapeByExpNum(keyword, type) {
  // DATAIMPULSE
  const userName = process.env.DATAIMPULSE_USER;
  const password = process.env.DATAIMPULSE_PASSWORD;
  const server = process.env.DATAIMPULSE_SERVER;
  const proxyUrl = `http://${userName}:${password}@${server}`;
  const port = await getAvailablePort();
  const proxyChainUrl = await proxyChain.anonymizeProxy({
    url: proxyUrl,
    port,
  });
  const proxyPort = proxyChainUrl.port;
  // DEFAULT puppeteer
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1280, height: 1200 },
    headless: "new",
    slowMo: 10,
    userAgent: getRandomUserAgent(),

    // DATAIMPULSE arg
    args: [`--proxy-server=${proxyChainUrl}`, "--disable-sync"],

    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  // intercept image loading except logos
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      request.resourceType() === "image" &&
      !request.url().includes("codigoViena")
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  try {
    switch (type) {
      case "expediente":
        await page.goto(
          "https://acervomarcas.impi.gob.mx:8181/marcanet/vistas/common/datos/bsqExpedienteCompleto.pgi"
        );
        break;
      case "registro":
        await page.goto(
          "https://acervomarcas.impi.gob.mx:8181/marcanet/vistas/common/datos/bsqRegistroCompleto.pgi"
        );
        break;
      default:
        break;
    }

    console.log("navegando a acervomarcas");

    await page.waitForSelector(".ui-inputfield", {
      visible: true,
      timeout: 30000,
    });
    await page.type(".ui-inputfield", keyword);
    await page.keyboard.press("Enter");

    console.log("buscando marca");

    // Esperar a que aparezca el selector lista de expediente o si va directo a la info de marca
    let selectorAppeared = await page.waitForSelector(
      "[id*=dlgLista], [src*='codigoViena']",
      {
        visible: true,
        timeout: 30000,
      }
    );
    const id = await selectorAppeared.evaluate((el) => el.id);

    // si encontro lista de expedientes va a ver si solo hay un registro de marca hara click en ese o si hay varios registros de marca entonces retorna multiples expedientes
    if (id.includes("dlgLista")) {
      try {
        const registerCells = await page.$$(
          "[id*=dlgLista] .tabla-franjas-encabezado",
          {
            timeout: 15000,
          }
        );

        const registerCellsText = await Promise.all(
          registerCells.map((cell) => cell.evaluate((el) => el.textContent))
        );
        const multipleRegisterCells = registerCellsText.filter((text) =>
          text.includes("REGISTRO DE MARCA")
        );
        console.log(multipleRegisterCells);
        if (multipleRegisterCells.length > 1) {
          console.log("Se encontraron varios registros de marca");
          return "multiples registros";
        }

        for (const cell of registerCells) {
          const text = await cell.evaluate((el) => el.textContent);
          if (text.includes("REGISTRO DE MARCA")) {
            console.log("Encontro el registro de marca");

            const link = await cell.evaluate((el) => {
              const sibling =
                el.nextElementSibling?.nextElementSibling?.firstChild;
              return sibling ? sibling.getAttribute("id") : null;
            });

            if (link) {
              console.log("Encontro el enlace " + link);
              await page.click(`[id*="${link}"]`);
              await page.waitForNavigation({
                waitUntil: "networkidle0",
                timeout: 30000,
              });
            } else {
              console.log("No se encontró el enlace");
            }
            break;
          }
        }
      } catch (error) {
        console.log(
          "Error encontrando el registro de marca correcto: " + error
        );
        return "error encontrando el registro de marca";
      }
    }

    // continuar con la extraccion de la informacion de la marca

    let logoName = "";

    await page.waitForSelector('[src*="codigoViena"]', {
      timeout: 15000,
    });

    // Obtener la imagen
    const element = await page.$('[src*="codigoViena=true"]', {
      visible: true,
    });
    if (element) {
      console.log("Image element found.");
      await page.waitForFunction(
        (element) =>
          element.complete &&
          element.naturalHeight !== 0 &&
          element.naturalWidth !== 0,
        { timeout: 10000 },
        element
      );

      // element.scrollIntoView();
      const screenshotOptions = {
        clip: await element.boundingBox(),
        type: "jpeg",
        quality: 100,
      };
      const scrapedLogo = await page.screenshot(screenshotOptions);
      logoName = scrapedLogo.toString("base64");
      console.log("Image screenshot captured successfully.");
    } else {
      console.log("Image element not found.");
    }

    await page.waitForSelector("#numExpId", {
      timeout: 10000,
    });
    await page.waitForSelector("#titNomId", {
      timeout: 10000,
    });
    await page.waitForSelector('[id*="claseProdId"]', {
      timeout: 10000,
    });

    const marca = {
      numExp: await page.$eval("#numExpId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      numReg: await page.$eval("#numRegId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      fechaUso: await page.$eval("#fechaUsoId", (element) => {
        const date = element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "");
        if (date) {
          const [day, month, year] = date.split("/");
          const formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        } else {
          return null;
        }
      }),
      fechaPres: await page.$eval("#fechaPresId", (element) => {
        const date = element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/^\s+/, "")
          .split(" ")[0];
        if (date) {
          const [day, month, year] = date.split("/");
          const formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        } else {
          return null;
        }
      }),
      fechaCon: await page.$eval("#fechaConId", (element) => {
        const date = element.parentNode.nextElementSibling.textContent.trim();
        if (date) {
          const [day, month, year] = date.split("/");
          const formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        } else {
          return null;
        }
      }),
      fechaVig: await page.$eval("#fechaVigId", (element) => {
        const date = element.parentNode.nextElementSibling.textContent.trim();
        if (date) {
          const [day, month, year] = date.split("/");
          const formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        } else {
          return null;
        }
      }),
      fechaPub: await page.$eval("#fechaPubId", (element) => {
        const date = element.parentNode.nextElementSibling.textContent.trim();
        if (date) {
          const [day, month, year] = date.split("/");
          const formattedDate = `${year}-${month}-${day}`;
          return formattedDate;
        } else {
          return null;
        }
      }),
      denom: await page.$eval("#denId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      descMar: await page.$eval("#descMarId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      tipoSol: await page.$eval("#tipoSolId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      tipoMarca: await page.$eval("#tipoMarcaId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      leyendas: await page.$eval("#leyendasId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      regInt: await page.$eval("#regIntId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      imagen: logoName,
      titNom: await page.$eval("#titNomId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      titDir: await page.$eval("#titDirId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      titPob: await page.$eval("#titPobId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      titCP: await page.$eval("#titCPId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      titPais: await page.$eval("#titPaisId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      titNac: await page.$eval("#titNacId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      titRFC: await page.$eval("#titRFCId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      titTel: await page.$eval("#titTelId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      titFax: await page.$eval("#titFaxId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s/g, "")
      ),
      titEmail: await page.$eval("#titEmailId", (element) =>
        element.parentNode.nextElementSibling.textContent
          .trim()
          .replace(/\s+/g, " ")
      ),
      clase: await page.$eval(
        '[id*="claseProdId"]',
        (element) => element.textContent.trim().replace(/\s/g, "")
      ),
      descClase: await page.$eval(
        '[id*="claseProdId"]',
        (element) =>
          element.parentNode.nextElementSibling.textContent
            .trim()
            .replace(/\s+/g, " ")
      ),
      status: "REGISTRADA",
      fechaDenegacion: null,
      fechaDenegacionProv: null,
      usoDec: null,
    };

    // get declaracion uso si hay registro y no hay fecha de uso

    if (marca.fechaCon && new Date(marca.fechaCon) > new Date("2018-08-10")) {
      const tramiteDecUso = await page.evaluate(() => {
        const cells = document.querySelectorAll(".tabla-franjas-encabezado");

        for (let cell of cells) {
          if (cell.textContent.toLowerCase().includes("declaracion de uso")) {
            return cell;
          }
        }
      });

      if (tramiteDecUso) {
        console.log("tramite declaracion de uso encontrado");
        marca.usoDec = "declarado";
      } else {
        console.log("tramite declaracion de uso no encontrado");
        marca.usoDec = "no declarado";
      }

      const tramites2 = await page.$$("span.glyphicon.glyphicon-search");

      if (!tramites2) {
        console.log("resoluciones no encontradas");
      } else {
        try {
          console.log("resoluciones encontradas");
          await page.evaluate(() => {
            // Find all span elements
            const spans = document.querySelectorAll(
              "span.glyphicon.glyphicon-search"
            );
            for (let span of spans) {
              const previousSibling =
                span.parentElement?.parentElement?.previousElementSibling
                  ?.previousElementSibling?.previousElementSibling
                  ?.previousElementSibling;
              if (
                previousSibling &&
                previousSibling.textContent
                  .toLowerCase()
                  .includes("declaracion de uso")
              ) {
                span.click();
                break;
              }
            }
          });

          let descMovElement;

          await page
            .waitForFunction(
              (selector) => document.querySelectorAll(selector).length > 0,
              {
                timeout: 5000,
              },
              '[id*="id_descMovimiento"]'
            )
            .then(async () => {
              descMovElement = await page.$$('[id*="id_descMovimiento"]', {
                timeout: 5000,
              });
            })
            .catch(() => {
              console.log(
                "No hay movimientos en el tramite de declaracion de uso"
              );
            });

          if (!descMovElement) {
            console.log("Movimientos no encontrados");
          } else {
            marca.usoDec = "declarado";
            await page.waitForFunction(
              (selector) =>
                document.querySelector(selector) &&
                document.querySelector(selector).textContent.length > 0,
              {},
              '[id*="id_descMovimiento"]'
            );

            const elementsText = await page.$$eval(
              ".tabla-franjas-encabezado",
              (elements) => {
                return elements.map((element) => {
                  return element.firstChild?.textContent;
                });
              }
            );

            if (elementsText.some((text) => text?.includes("FAVORABLE"))) {
              console.log("FAVORABLE");
              marca.usoDec = "favorable";
            }
          }
          const closeModal = await page.$(
            ".ui-icon.ui-icon-closethick",
            (element) => element.click()
          );
        } catch (error) {
          console.log("Error encontrando tramite declaracion de uso: " + error);
        }
      }
    } else if (marca.fechaCon && new Date(marca.fechaCon) < new Date("2018-08-10")) {
      marca.usoDec = "N/A";
    }

    // revisar los movimientos del tramite de marca para establecer el status si no hay registro

    if (marca.fechaCon === null) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      const tramites = await page.$("#dtTblTramitesId");

      if (!tramites) {
        console.log("Tramites table not found");
        marca.status = "PENDIENTE";
      } else {
        const solicitudButton = await page.$(".glyphicon.glyphicon-search");

        if (!solicitudButton) {
          console.log("Solicitud button not found");
          marca.status = "PENDIENTE";
        } else {
          try {
            await page.evaluate(() => {
              // Find all span elements
              const spans = document.querySelectorAll(
                "span.glyphicon.glyphicon-search"
              );

              // Iterate through the spans to find the one with the specified conditions
              for (let span of spans) {
                const previousSibling =
                  span.parentElement?.parentElement?.previousElementSibling
                    ?.previousElementSibling?.previousElementSibling
                    ?.previousElementSibling;
                if (
                  previousSibling &&
                  previousSibling.textContent.includes("SOLICITUD DE REGISTRO")
                ) {
                  span.click();
                  break;
                }
              }
            });

            await page.waitForSelector('[id*="id_descMovimiento"]', {
              timeout: 3000,
            });
          } catch (error) {
            console.log("Timeout error occurred");
            marca.status = "PENDIENTE";
          }
          const element = await page.$('[id*="id_descMovimiento"]');

          if (!element) {
            console.log("Selector not found");
            marca.status = "PENDIENTE";
          } else {
            await page.waitForFunction(
              (selector) =>
                document.querySelector(selector) &&
                document.querySelector(selector).textContent.length > 0,
              {},
              '[id*="id_descMovimiento"]'
            );

            const elementsText = await page.$$eval(
              ".tabla-franjas-encabezado",
              (elements) => {
                return elements.map((element) => {
                  return element.firstChild?.textContent;
                });
              }
            );

            // get fecha denegacion

            const fechaDenegacion = await page.$$eval(
              ".tabla-franjas-encabezado",
              (elements) => {
                for (const element of elements) {
                  if (element.firstChild?.textContent.includes("NEGATIVA")) {
                    const fechaNegativaText =
                      element.nextElementSibling?.nextElementSibling
                        ?.nextElementSibling?.firstChild?.textContent;
                    const fechaNegativaTextMatch = fechaNegativaText?.match(
                      /(?:notifica|entregado|fecha próxima de envío)(?=(.*?\d{2}\/\d{2}\/\d{4}))/i
                    );
                    const fechaNegativa = fechaNegativaTextMatch
                      ? fechaNegativaTextMatch[1]?.trim()
                      : "";
                    const fechaNegativaOnlyDate =
                      fechaNegativa.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
                    const fechaNegativaOnlyDateFormatted = fechaNegativaOnlyDate
                      ?.split("/")
                      .reverse()
                      .join("-");
                    return fechaNegativaOnlyDateFormatted;
                  }
                }
                return null;
              }
            );

            if (fechaDenegacion) {
              marca.fechaDenegacion = fechaDenegacion;
            }

            // get fecha denegacion provisional

            const fechaDenegacionProvisional = await page.$$eval(
              ".tabla-franjas-encabezado",
              (elements) => {
                for (const element of elements) {
                  if (
                    element.firstChild?.textContent.includes(
                      "DENEGACION PROVISIONAL"
                    ) ||
                    element.firstChild?.textContent.includes(
                      "SE LE CITA ANTERIORIDAD"
                    ) ||
                    element.firstChild?.textContent.includes(
                      "SE LE COMUNICA IMPEDIMENTO LEGAL"
                    ) ||
                    element.firstChild?.textContent.includes(
                      "EL QUE SE INDICA"
                    ) ||
                    element.firstChild?.textContent.includes(
                      "DEBE CUMPLIR CON LOS REQUISITOS"
                    )
                  ) {
                    console.log("denegacion provisional found");
                    const fechaProvisionalText =
                      element.nextElementSibling?.nextElementSibling
                        ?.nextElementSibling?.firstChild?.textContent;
                    const fechaProvisionalTextMatch =
                      fechaProvisionalText?.match(
                        /(?:notifica|entregado|Fecha próxima de envío)(?=(.*?\d{2}\/\d{2}\/\d{4}))/i
                      );
                    const fechaProvisional = fechaProvisionalTextMatch
                      ? fechaProvisionalTextMatch[1]?.trim()
                      : "";
                    const fechaProvisionalOnlyDate =
                      fechaProvisional.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
                    const fechaProvisionalOnlyDateFormatted =
                      fechaProvisionalOnlyDate?.split("/").reverse().join("-");
                    console.log(fechaProvisionalOnlyDateFormatted);
                    return fechaProvisionalOnlyDateFormatted;
                  }
                }
                return null;
              }
            );

            if (fechaDenegacionProvisional) {
              marca.fechaDenegacionProv = fechaDenegacionProvisional;
            }

            // asign status

            if (elementsText.some((text) => text?.includes("NEGATIVA"))) {
              marca.status = "DENEGADA";
            } else if (
              elementsText.some((text) => text?.includes("abandonado"))
            ) {
              marca.status = "ABANDONADA";
            } else if (
              elementsText.some((text) => text?.includes("DESISTIDA"))
            ) {
              marca.status = "DESISTIDA";
            } else if (
              elementsText.some((text) => text?.includes("SUSPENSO"))
            ) {
              marca.status = "SUSPENDIDA";
            } else if (
              elementsText.some((text) =>
                text?.includes("DENEGACION PROVISIONAL")
              ) ||
              elementsText.some((text) =>
                text?.includes("SE LE CITA ANTERIORIDAD")
              ) ||
              elementsText.some((text) =>
                text?.includes("SE LE COMUNICA IMPEDIMENTO LEGAL")
              ) ||
              elementsText.some((text) => text?.includes("EL QUE SE INDICA")) ||
              elementsText.some((text) =>
                text?.includes("DEBE CUMPLIR CON LOS REQUISITOS")
              )
            ) {
              marca.status = "DEN PROV";
            } else {
              marca.status = "PENDIENTE";
            }
          }
        }
      }
    }
    return marca;

  } catch (error) {
    console.error("Error scraping data: " + error);
    marca = "";
    
  } finally {
    await browser.close();
    await proxyChain.closeAnonymizedProxy(String(proxyPort));
    console.log("Done");
  }
}

module.exports = searchAndScrapeByExpNum;
