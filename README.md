## Alloy Virtual Server

**Alloy Virtual Server** is the backend service worker for the **Alloy Virtual Assistant**. It powers scheduling, notifications, API integrations, and secure data handling for the assistant’s voice and text interactions. Built with Express, Supabase, Firebase Admin, Twilio, and other robust Node.js tools.

---

## Features

- **Express API:** Fast and lightweight REST API for handling requests.
- **Supabase & Firebase:** Real-time database operations and admin services.
- **Scheduled Tasks:** Automate jobs with `node-schedule`.
- **Rate Limiting & Security:** Protect endpoints using CORS and rate limiting.
- **Twilio Integration:** Send SMS or voice notifications.
- **Resend:** Email notifications and transactional mail.
- **Logging:** Monitor server logs using Morgan.

---

## Tech Stack

- **Framework:** Express.js
- **Databases:** Supabase, Firebase Admin
- **Utilities:** Node Schedule, Twilio, Resend, CORS, Body Parser
- **Logging & Debugging:** Morgan
- **Environment Config:** dotenv

---

## Getting Started

### 1 ↦ Clone the Repository

```bash
git clone https://github.com/project-00233/alloy_va_server.git
cd alloy_va_server
```

### 2 ↦ Install Dependencies

```bash
npm install
```

### 3 ↦ Set Up Environment Variables

Create a `.env` file in the project root and configure your secrets (e.g., API keys, database URLs, Twilio credentials, etc.):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FIREBASE_CONFIG=your_firebase_config
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
...
```

---

## ⚡ Running the Server

### Development Mode

Starts the server with auto-reload using `nodemon`:

```bash
npm run start
```

or

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

---

## ✅ Linting

Check for linting issues with:

```bash
npx eslint .
```

---

## 🤝 Contributing

Pull requests are welcome! Please fork the repository, create a feature branch, and open a pull request with clear details.

---

## 📄 License

This project is licensed under the **Apache License Version 2.0, January 2004
http://www.apache.org/licenses/ **.

---

## ⭐️ Show Your Support

If you find this server helpful, please ⭐️ star the repository and share it with the community!
