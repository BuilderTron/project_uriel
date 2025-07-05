# Project Uriel

A modern personal portfolio application built with React and Firebase, showcasing professional experience, projects, blog posts, and contact information.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, Storage)
- **Infrastructure**: Docker, Firebase Emulator Suite
- **Deployment**: Firebase Hosting / App Hosting
- **CI/CD**: GitHub Actions

## 📋 Features

- **Portfolio Showcase**: Display projects with descriptions, technologies, and live demos
- **Professional Experience**: Timeline of work history and achievements
- **Blog System**: Write and publish articles with Markdown support
- **Contact Form**: Secure contact system with email notifications
- **Admin Dashboard**: Content management interface
- **Performance Optimized**: Fast loading times and SEO-friendly
- **Responsive Design**: Works seamlessly on all devices
- **Dark Mode**: Built-in theme switching

## 🏗️ Project Structure

```
project_uriel/
├── services/
│   ├── backend/         # Firebase functions and rules
│   └── frontend/        # React application
├── infra/              # Environment configurations
├── scripts/            # Developer utilities
├── docs/               # Documentation
└── docker-compose.yml  # Local development setup
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Firebase CLI
- Git

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project_uriel.git
   cd project_uriel
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Start the development environment:
   ```bash
   source activate
   up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Firebase Emulator UI: http://localhost:4000

## 📚 Documentation

- [Project Plan](docs/PROJECT_PLAN.md) - Detailed implementation roadmap
- [Architecture](docs/ARCHITECTURE.md) - System design and decisions
- [Development Guide](docs/DEVELOPMENT.md) - Setup and contribution guidelines
- [API Documentation](docs/API.md) - Backend endpoints and data models

## 🔧 Development Commands

After sourcing the `activate` script, you'll have access to these commands:

- `up` - Start all services
- `down` - Stop all services
- `logs` - View service logs
- `test` - Run test suite
- `build` - Build for production
- `deploy` - Deploy to Firebase

## 🧪 Testing

```bash
# Run all tests
test

# Run specific test suites
test:unit
test:integration
test:e2e
```

## 📈 Performance

- Lighthouse Score: 95+
- Time to Interactive: <3s
- SEO Score: 100
- Accessibility: WCAG 2.1 AA compliant

## 🚀 Deployment

The project uses GitHub Actions for CI/CD:

1. Push to `main` triggers staging deployment
2. Create a release tag for production deployment
3. Rollback available through Firebase console

## 🤝 Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Jose J Lopez**

- Portfolio: [Coming Soon]
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by best practices from the developer community
- Special thanks to all contributors

---

**Status**: 🚧 Under Development

*Last Updated: January 2025*