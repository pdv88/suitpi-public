# SuitPI – Trademark Workflow Automation SaaS

SuitPI is a full-stack SaaS platform designed to automate and streamline trademark management tasks for legal professionals and brand teams. Built with the SERN stack (SQL, Express, React, Node.js), SuitPI centralizes trademark data, automates updates, and proactively generates deadline reports — significantly reducing manual workload.

---

## 🔧 Features

- ✅ **Web Scraping Engine**: Extracts trademark information from official databases based on user needs.
- ✅ **Status Monitor**: Automatically detects and updates trademark status changes.
- ✅ **Stripe Billing Integration**: Manages user subscriptions with webhook-based sync.
- ✅ **Deadline Reports**: Generates weekly and monthly trademark reports with upcoming actions or renewals.
- ✅ **User Dashboard**: Interactive frontend to view trademark progress and reports.
- ✅ **Productivity Impact**: Reduces manual tracking from ~7 days to just a few hours.

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Payments**: Stripe (with webhook handling)
- **Web Scraping**: Puppeteer
- **Notifications**: Cronjobs

---

## ⚙️ Setup Notes

This app requires a MySQL database, a `.env` file with various API keys and credentials, and webhook configurations for Stripe. Due to the complexity of local setup and deactivated scraping functionality (due to IMPI's anti-bot protection), the app may not run fully without additional configuration.

For security reasons, this is a cleaned version of the original private repo. The scraping code, Stripe billing, and reporting logic are all present, but may require adjustments to run locally.

---

## ⚠️ Known Limitations

- Web scraping from IMPI is currently disabled due to stricter anti-bot systems.
- The application is otherwise fully functional, including the dashboard, database, Stripe billing, and reports.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

- Pablo Humberto de la Garza Vargas (@pvd88)
