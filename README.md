# Doughmination System Server

A lightweight web application that interfaces with the PluralKit API to display system members, current fronters, and individual member profiles in a clean and simple interface.

## Features

- 👥 Display current fronting members with automatic favicon and title updates
- 👤 View individual member profiles with detailed information
- 🔒 Admin dashboard for system management (password protected)
- 📊 Fronting metrics and switch frequency statistics
- 👥 User management with multiple accounts support
- 📱 Responsive design for mobile and desktop

## Hosting

The site is hosted at [https://www.doughmination.win](https://www.doughmination.win)

## This is for:

- Displaying your PluralKit system members in a user-friendly interface
- Showing who's fronting, with automatic favicon and title updates
- Viewing individual member details like pronouns and descriptions
- Switching between dark and light themes depending on vibes
- Managing front switching through the Admin interface
- Tracking fronting time and switch metrics

*Note: this will be moving to /plu/ral in future images*

## Technical Stack

### Backend
- FastAPI (Python)
- JWT Authentication
- PluralKit API integration

### Frontend
- Modern web interface with responsive design
- Tailwind CSS for styling

## Installation & Setup

1. Download the [compose.yml](https://github.com/CloveTwilight3/doughmination.win/blob/main/compose.yml) from this repo.
2. Update the variables to be the accurate info. JWT_SECRET can be a keyboard smash, it doesn't matter.
3. Run the following commands:
```bash
docker compose pull
docker compose up -d
```
4. To check the logs, you can run:
```bash
docker compose logs -f # To watch them as they run
docker compose logs backend # To watch the backend
docker compose logs frontend # To watch the frontend
```

## Notes:

This is a personalized project. It's open-source in case others who are familiar with PluralKit and self-hosting want to use or adapt it — but it's **not** built to be a plug-and-play solution or official tool.

If you know what you're doing and want to tweak it for your own system, feel free to fork it!

## License
This project is licensed under the [MIT License.](https://github.com/CloveTwilight3/doughmination.win?tab=MIT-1-ov-file)
Feel free to use, modify, and share it as long as the license notice is preserved.

---

# Contributors
<a href="https://github.com/CloveTwilight3/doughmination.win/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CloveTwilight3/doughmination.win" />
</a>

---

Made with ✨ for the Doughmination System.
