# Korean Wheels website (with admin and bookings)

Visitors can browse and view cars and send booking requests.
Only the admin (password login) can add, edit or delete cars, upload photos and manage bookings.

## Run it in VS Code
1. Install Node.js (version 18 or newer) from nodejs.org.
2. Open this folder in VS Code, then open the terminal (Terminal > New Terminal).
3. Set your own admin password, then start the server:
   - Windows (PowerShell):  `$env:ADMIN_PASSWORD="your-strong-password"; node server.js`
   - Mac / Linux:           `ADMIN_PASSWORD="your-strong-password" node server.js`
4. Open http://localhost:3000 (the website) and http://localhost:3000/admin.html (admin).

Nothing to install: `npm install` is not needed.
If you do not set ADMIN_PASSWORD the password is `admin123`. Change it before going live.

## What the admin can do (/admin.html)
- Add a car: name, brand, body type, year, mileage, price, highlight, description, photo and ratings.
- Edit or delete any car. Tick "Mark as sold" to hide a car from the public site.
- See booking requests from visitors, set their status (New, Contacted, Confirmed, Done) or delete them.

## Where data is stored
- Cars: `data/cars.json`   Bookings: `data/bookings.json`   Photos: `public/uploads/`
- Back these up regularly. The first run copies the starter cars from `public/seed-cars.json`.

## Putting it online
Host the folder on any Node host (Render, Railway, a VPS). Set the ADMIN_PASSWORD environment
variable there and use HTTPS. Keep the `data` and `public/uploads` folders on persistent storage.

## Notes
- The starter cars use placeholder years, mileage and prices. Edit them in the admin page.
- Phone, address and hours are in the "Book a viewing" section of `public/index.html`.
- Fonts and the Three.js particles load from the internet (Google Fonts and cdnjs).
