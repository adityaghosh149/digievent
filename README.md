# Digievent - University Event Management System

Digievent is a web-based platform that simplifies and automates event management in universities. It bridges the gap between event organizers and students by providing tools for creating, managing, promoting, and booking events online.

## 🚀 Features

- Event creation and management for organizers
- Online ticket sales with optional reservation system
- Student-friendly interface to browse and book events
- Integrated ticket queue for fair ticket access
- Super Admin, Admin, Organizer, and Student user roles
- Scalable and modular backend API

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tanstack Query, Zustand
- **Backend**: Node.js, Express, MongoDB
- **Hosting**: Vercel (frontend), Render (backend)

## 📝 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adityaghosh149/digievent.git
   cd digievent-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=your_frontend_origin

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d

   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=7d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the server:

   ```bash
   npm start
   ```

Server will run at `http://localhost:8000`.

## ⚠️ Project Status

This project is currently in the initial development phase. Features are being added progressively, and the platform is not yet complete. Contributions and feedback are welcome as we continue development.

## 🏗️ Contributing

Contributions are welcome! Feel free to open issues or pull requests.

## 🌐 Frontend Repository

The frontend code for the Digievent platform is hosted [here](https://github.com/subx6789/digievent).


## 📄 License

Licensed under the [MIT License](LICENSE).

