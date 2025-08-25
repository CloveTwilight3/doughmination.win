# Doughmination System Server

A lightweight web application that interfaces with the PluralKit API to display system members, current fronters, and individual member profiles in a clean and simple interface. Features minimal UI for clarity.

## Features

- 👥 Display current fronting members with automatic favicon and title updates
- 👤 View individual member profiles with detailed information
- 🔒 Admin dashboard for system management (password protected)
- 📊 Fronting metrics and switch frequency statistics
- 👥 User management with multiple accounts support
- 📱 Responsive design for mobile and desktop

Currently optimized for dark mode. Light mode support is planned once stability is ensured.

## Hosting

The site is hosted at [https://plural.clovetwilight3.co.uk](https://plural.clovetwilight3.co.uk)

## This is for:

- Displaying your PluralKit system members in a user-friendly interface
- Showing who's fronting, with automatic favicon and title updates
- Viewing individual member details like pronouns and descriptions
- Switching between dark and light themes depending on vibes
- Managing front switching through the Admin interface
- Tracking fronting time and switch metrics

## Technical Stack

### Backend
- FastAPI (Python)
- JWT Authentication
- PluralKit API integration

### Frontend
- Modern web interface with responsive design
- Tailwind CSS for styling

## Installation & Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Create and edit your environment variables
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
```

### Environment Variables

Create a `.env` file in the `backend` directory with:

```
SYSTEM_TOKEN=your_pluralkit_token
JWT_SECRET=your_secure_random_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_DISPLAY_NAME=Administrator
```

## Notes:

This is a personalized project. It's open-source in case others who are familiar with PluralKit and self-hosting want to use or adapt it — but it's not built to be a plug-and-play solution or official tool.

If you know what you're doing and want to tweak it for your own system, feel free to fork it!

## License
This project is licensed under the [MIT License.](https://github.com/CloveTwilight3/plural-web?tab=MIT-1-ov-file)
Feel free to use, modify, and share it as long as the license notice is preserved.

---

# Contributors
<a href="https://github.com/CloveTwilight3/clovetwilight3/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CloveTwilight3/plural.clovetwilight3.co.uk" />
</a>

---

Made with ✨ by and for the Doughmination System.
