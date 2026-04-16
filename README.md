# Muhammad Hammad Tahir - Portfolio

Premium single-page portfolio website built with HTML, CSS, and JavaScript.

## Run locally

1. Open `index.html` directly in a browser.
2. Or use VS Code Live Server for auto-reload.

## Run on Wi-Fi (for phone testing)

1. Open PowerShell in this project folder.
2. Run:
   - `powershell -ExecutionPolicy Bypass -File .\start-wifi.ps1`
3. It will print two URLs:
   - PC URL (localhost)
   - Mobile URL (your local IP)
4. Connect your phone to the same Wi-Fi and open the Mobile URL.

Notes:
- Keep the PowerShell window open while testing.
- Press `Ctrl + C` to stop the server.
- If mobile still cannot open, allow Node.js through Windows Firewall (Private network).

## Customize quickly

1. Replace profile image by updating `assets/profile-placeholder.svg` or switching source in `index.html`.
2. Replace CV PDF with your final file while keeping path:
   - `assets/Muhammad-Hammad-Tahir-CV-2026.pdf`
3. Update GitHub link in `index.html` footer.

## Contact Form

The contact form sends directly to `hammadtahirfdc@gmail.com` using FormSubmit.

1. First submission may require a FormSubmit confirmation email. Approve it once.
2. After that, messages will arrive directly in your inbox.
3. The form includes a fallback email draft if the backend request is blocked.

## Deploy on GitHub Pages

1. Create a GitHub repo and push this project to `main` branch.
2. In repo settings, open **Pages** and set **Source** to **GitHub Actions**.
3. The workflow file `.github/workflows/deploy-pages.yml` will deploy automatically on push.
