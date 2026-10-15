# Contributing to Real-time Sketchpad

Thank you for considering contributing to Real-time Sketchpad! We welcome contributions from the community.

## 📋 How to Contribute

### Reporting Bugs
Before submitting a bug report, please check if it has already been reported. When you are ready to report a bug, please include:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots or screen recordings if applicable
- Your environment (browser version, OS, etc.)

### Suggesting Features
Feature requests are welcome! Please provide:
- A clear and descriptive title
- Detailed description of the feature
- Use cases and benefits
- Any potential implementation considerations

### Submitting Changes
We gladly accept pull requests. Here's our process:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yeabTesfaye/real-time-sketchpad.git
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature-or-fix-name
   ```
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit your changes** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add new drawing tool"
   ```
   or
   ```bash
   git commit -m "fix: resolve WebSocket connection issue"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature-or-fix-name
   ```
8. **Open a Pull Request** against the `main` branch

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local  # Edit as needed
```

### Backend Setup
```bash
cd backend
pip install -e ".[dev]"
cp .env.example .env  # Edit as needed
alembic upgrade head  # Initialize database
```

### Running the Application
```bash
# From root directory
npm run dev  # Starts both frontend and backend
```

Or run separately:
```bash
# In one terminal
npm run dev:frontend

# In another terminal
npm run dev:backend
```

## 📝 Coding Standards

### Frontend (TypeScript/React)
- Follow the existing code style in the repository
- Use functional components with hooks
- Prefer TypeScript interfaces over types for object shapes
- Use Tailwind CSS for styling
- Follow shadcn/ui patterns when extending components
- Write small, focused components
- Add JSDoc comments for complex functions
- Use meaningful variable and function names
- Keep components under 150 lines when possible

### Backend (Python)
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and return values
- Write descriptive docstrings for public functions and classes
- Keep functions focused and under 50 lines when possible
- Use meaningful variable and function names
- Follow existing patterns for error handling and validation
- Add unit tests for new functionality
- Use Ruff for linting: `ruff check .`

### General
- Write clear, descriptive commit messages
- Update documentation when changing functionality
- Add tests for new features and bug fixes
- Follow the existing file organization patterns
- Keep dependencies up to date when possible
- Consider performance implications of changes

## 🧪 Testing

### Frontend Tests
While testing setup is opt-in for the frontend, we recommend:
- Unit tests with Vitest or Jest
- Component testing with React Testing Library
- End-to-end testing with Playwright or Cypress

### Backend Tests
Run the test suite:
```bash
cd backend
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=term-missing
```

### Writing Good Tests
- Test one thing per test case
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Test both positive and negative cases
- Use fixtures for common setup
- Mock external dependencies when appropriate

## 📄 Documentation

- Keep README files up to date with changes
- Update API documentation when endpoints change
- Add inline comments for complex logic
- Update docstrings when modifying functions
- Ensure all public APIs are documented

## 🎯 Review Process

1. **Initial Review**: A maintainer will review your PR for completeness
2. **Feedback**: You may be asked to make changes or answer questions
3. **Approval**: Once approved, a maintainer will merge your PR
4. **Release**: Changes will be included in the next release

## �erkindness

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## ❓ Need Help?

If you need help with your contribution, please:
- Check the existing documentation
- Look at similar implementations in the codebase
- Ask questions in the PR comments
- Reach out to maintainers if you're stuck

Thank you again for contributing to Real-time Sketchpad!

---
*Made with ❤️ by contributors like you*