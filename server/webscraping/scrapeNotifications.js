const puppeteer = require("puppeteer");

async function scrapeNotifications() {
    const browser = await puppeteer.launch({
      slowMo: 25,
      protocolTimeout: 240000,
      defaultViewport: { width: 800, height: 600 },
      headless: "new",
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    let notifications = [];
    try {
      // ir a la pagina del IMPI SIGA
      await page.goto("https://siga.impi.gob.mx/", {
        waitUntil: "domcontentloaded",
      });
      console.log("Navigated to IMPI SIGA");
      // esperar a que cargue el boton de gacetas
      await page.waitForSelector(
        ".mat-cell.cdk-cell.cdk-column-nombreGaceta.mat-column-nombreGaceta.ng-star-inserted"
      );
  
      // hacer scroll hasta el final de la pagina
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
  
      // hacer click en el boton de gacetas
      await page.click(".icon.fa.fa-download.fa-4x");
      console.log("Clicked on buscar gacetas Gacetas");
      // esperar a que cargue el formulario de gacetas
      await page.waitForSelector(".mat-form-field-infix.ng-tns-c2842056177-7");
  
      // hacer click en el select de tipo de gaceta
      await page.click(".mat-form-field-infix.ng-tns-c2842056177-7");
      
      // seleccionar gacetas de marcas
      await page.click("#mat-option-5");
      console.log("Clicked on tipo de gaceta");
  
      await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && !element.classList.contains('mat-button-disabled');
        },
        {},
        ".mat-focus-indicator.mat-icon-button.mat-button-base"
      );
  
      // hacer click en el select de fecha de publicacion
      await page.click(".mat-datepicker-toggle-default-icon.ng-star-inserted");
  
      // esperar a que cargue el calendario
      await page.waitForSelector(
        ".mat-calendar-body-cell-content.mat-focus-indicator.mat-calendar-body-today"
      );
  
      // seleccionar dos veces la fecha de hoy para obtener las gacetas de hoy
      await page.click(
        ".mat-calendar-body-cell-content.mat-focus-indicator.mat-calendar-body-today"
      );
      await page.click(
        ".mat-calendar-body-cell-content.mat-focus-indicator.mat-calendar-body-today"
      );
      console.log("selecting todays date");
  
      // hacer click en el tipo de notificacion
      await page.click(".mat-form-field-infix.ng-tns-c2842056177-10");
  
      // seleccionar notificaciones de oficios
      await page.click("#mat-option-12");
      console.log("selecting notificacionde resoluciones");
  
      // hacer click en el boton de buscar
      await page.click(
        ".mat-focus-indicator.mat-raised-button.mat-button-base.mat-success"
      );
      console.log("Clicked on buscar gacetas");
  
      // esperar a que carguen las gacetas
      await page.waitForSelector("a.mat-tooltip-trigger");

  
      // hacer click en el link de notificaciones
      await page.click("a.mat-tooltip-trigger");
      console.log("Clicked on notificaciones");
  
      let gaceta1NextPageAvailable = true;
      let i = 1;
  
      while (gaceta1NextPageAvailable) {
        // esperar a que carguen las notificaciones
        await page.waitForFunction(
          (selector) =>
            document.querySelector(selector) &&
            document.querySelector(selector).firstElementChild?.textContent
              .length > 0,
          {timeout: 500000},
          "td.mat-column-Descripci-n-del-oficio"
        );
        // guardar las notificaciones en un array
        const newNotifications = await page.evaluate(() => {
          const notifications = Array.from(
            document.querySelectorAll("tr.mat-row.cdk-row.ng-star-inserted")
          );
          return notifications
            .map((notification) => {
              const num = notification.querySelector(".cdk-column-count");
              const numExp = notification.querySelector(".cdk-column-Expediente");
              const numReg = notification.querySelector(
                ".cdk-column-Registro-de-Marca"
              );
              const serExp = notification.querySelector(
                ".cdk-column-Serie-del-expediente"
              );
              const descOficio = notification.querySelector(
                ".cdk-column-Descripci-n-del-oficio"
              );
              const numOficio = notification.querySelector(
                ".cdk-column-N-mero-del-oficio"
              );
              const fechaOficio = notification.querySelector(
                ".cdk-column-Fecha-del-oficio"
              );
              const urlOficio = notification.querySelector(
                ".cdk-column-Enlace-electr-nico a"
              );
  
              let formattedDate = null;
              if (fechaOficio && fechaOficio.textContent) {
                const [day, month, year] = fechaOficio.textContent.split("/");
                formattedDate = `${year}-${month}-${day}`;
              }
              let today = new Date();
              let dd = String(today.getDate()).padStart(2, "0");
              let mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
              let yyyy = today.getFullYear();
              today = `${yyyy}-${mm}-${dd}`;
  
              return {
                num: num ? num.textContent.trim() : null,
                numExp: numExp ? numExp.textContent.trim() : null,
                numReg: numReg ? numReg.textContent.trim() : null,
                serExp: serExp ? serExp.textContent.trim() : null,
                descOficio: descOficio ? descOficio.textContent.trim() : null,
                numOficio: numOficio ? numOficio.textContent.trim() : null,
                fechaOficio: formattedDate,
                fechaGaceta: today,
                urlOficio: urlOficio ? urlOficio.href : null,
              };
            })
            .filter(Boolean);
        });
  
        notifications = [...notifications, ...newNotifications];
  
        // // hacer scroll hasta el final de la pagina para que no haya problema en detectar el boton de la proxima pagina
        // await page.evaluate(() => {
        //   window.scrollTo(0, document.body.scrollHeight);
        // });
  
        // detectar si boton de pagina siguiente esta deshabilitado
        const nextPageButtonDisabled = await page.$(
          ".mat-paginator-navigation-next.mat-button-disabled"
        );
        
        console.log("Gaceta 1 pagina " + i + " next button disabled: " + nextPageButtonDisabled);
        
        if (!nextPageButtonDisabled) {
          i++;
          await page.waitForSelector("a.ng-star-inserted");
          // seleccionar texto de primer link de pagina para comparar con el texto del link de la proxima pagina
          const previousTextElement = await page.$(
            "a.ng-star-inserted:first-child"
          );
          // obtener el texto del link
          const previousText = previousTextElement
            ? await page.evaluate((el) => el.textContent, previousTextElement)
            : null;
            await Promise.all([
            // hacer click en el boton de la proxima pagina 
            page.click(
              ".mat-paginator-navigation-next.mat-button-base"
            ),
            //esperar a que cargue hasta que el texto del link de la proxima pagina cambie
            await page.waitForFunction(
              (selector, previousText) => {
                const element = document.querySelector(selector);
                return element && element.textContent !== previousText;
              },
              {},
              "a.ng-star-inserted:first-child",
              previousText 
            ),
            await page.waitForNetworkIdle(),
          ]);
        } else {
          gaceta1NextPageAvailable = false;
          console.log("next page button disabled");
        }
      } 
  
      // regresar a la seleccion de gacetas
      await page.click("button.asd");
  
      // esperar a que carguen las gacetas
      await page.waitForSelector("a.mat-tooltip-trigger.ng-star-inserted", {
        visible: true, timeout: 200000
      });
  
      // hacer scroll hasta el final de la pagina
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
  
      // si existe un segundo link entonces hacer click en el segundo link de gacetas
      const links = await page.$$("a.mat-tooltip-trigger.ng-star-inserted");
  
      // check if there are more than one link
      if (links.length > 1) {
        await Promise.all([links[1].click()]);
        console.log("clicking second link");
  
        let gaceta2NextPageAvailable = true;
      let j = 1;
  
        while (gaceta2NextPageAvailable) {
          // esperar a que carguen las notificaciones
          await page.waitForFunction(
            (selector) =>
              document.querySelector(selector) &&
              document.querySelector(selector).firstElementChild?.textContent
                .length > 0,
            {timeout: 500000},
            "td.mat-column-Descripci-n-del-oficio"
          );
          // guardar las notificaciones en un array
          const newNotifications = await page.evaluate(() => {
            const notifications = Array.from(
              document.querySelectorAll("tr.mat-row.cdk-row.ng-star-inserted")
            );
            return notifications
              .map((notification) => {
                const num = notification.querySelector(".cdk-column-count");
                const numExp = notification.querySelector(".cdk-column-Expediente");
                const numReg = notification.querySelector(
                  ".cdk-column-Registro-de-Marca"
                );
                const serExp = notification.querySelector(
                  ".cdk-column-Serie-del-expediente"
                );
                const descOficio = notification.querySelector(
                  ".cdk-column-Descripci-n-del-oficio"
                );
                const numOficio = notification.querySelector(
                  ".cdk-column-N-mero-del-oficio"
                );
                const fechaOficio = notification.querySelector(
                  ".cdk-column-Fecha-del-oficio"
                );
                const urlOficio = notification.querySelector(
                  ".cdk-column-Enlace-electr-nico a"
                );
    
                let formattedDate = null;
                if (fechaOficio && fechaOficio.textContent) {
                  const [day, month, year] = fechaOficio.textContent.split("/");
                  formattedDate = `${year}-${month}-${day}`;
                }

                let today = new Date();
              let dd = String(today.getDate()).padStart(2, "0");
              let mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
              let yyyy = today.getFullYear();
              today = `${yyyy}-${mm}-${dd}`;
    
                return {
                  num: num ? num.textContent.trim() : null,
                  numExp: numExp ? numExp.textContent.trim() : null,
                  numReg: numReg ? numReg.textContent.trim() : null,
                  serExp: serExp ? serExp.textContent.trim() : null,
                  descOficio: descOficio ? descOficio.textContent.trim() : null,
                  numOficio: numOficio ? numOficio.textContent.trim() : null,
                  fechaOficio: formattedDate,
                  fechaGaceta: today,
                  urlOficio: urlOficio ? urlOficio.href : null,
                };
              })
              .filter(Boolean);
          });
    
          notifications = [...notifications, ...newNotifications];
    
          // await page.evaluate(() => {
          //   window.scrollTo(0, document.body.scrollHeight);
          // });
    
          const nextPageButtonDisabled = await page.$(
            ".mat-paginator-navigation-next.mat-button-disabled"
          );
          
          console.log("Gaceta 2 page " + j + " next button disabled: " + nextPageButtonDisabled);
          
          if (!nextPageButtonDisabled) {
            j++;
            const previousTextElement = await page.$(
              "a.ng-star-inserted:first-child"
            );
            const previousText = previousTextElement
              ? await page.evaluate((el) => el.textContent, previousTextElement)
              : null;
            await Promise.all([
              page.click(
                ".mat-paginator-navigation-next.mat-button-base"
              ),
              await page.waitForFunction(
                (selector, previousText) => {
                  const element = document.querySelector(selector);
                  return element && element.textContent !== previousText;
                },
                {},
                "a.ng-star-inserted:first-child",
                previousText 
              ),
              await page.waitForNetworkIdle(),
            ]);
  
          } else {
            gaceta2NextPageAvailable = false;
            console.log("next page button disabled");
          }
        } 
  
  
      }
  
      return notifications;
    } catch (error) {
      console.error("Error scraping notifications: " + error);
    } finally {
      await browser.close();
    }
  }

  module.exports = scrapeNotifications();