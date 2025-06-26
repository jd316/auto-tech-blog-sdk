# Contributing to auto-tech-blog

Thank you for your interest in contributing to auto-tech-blog! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/auto-tech-blog.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up your environment variables (copy `.env.example` to `.env`)

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint
```

### Testing the CLI Locally

```bash
# Link the package locally
npm link

# Test the CLI
auto-tech-blog --help
```

## Code Style

- We use ESLint with a standard configuration
- Code should be formatted with 2-space indentation
- Use single quotes for strings
- Always use semicolons
- Follow the existing code style in the project

## Pull Request Process

1. Ensure all tests pass
2. Update the README.md if you've added new features
3. Update the CHANGELOG.md with your changes
4. Ensure your branch is up to date with main
5. Submit a pull request with a clear description of changes

## Types of Contributions

### Bug Fixes

- Create an issue first to discuss the bug
- Reference the issue number in your PR

### New Features

- Discuss the feature in an issue first
- Ensure the feature aligns with the project goals
- Add tests for new functionality
- Update documentation

### Documentation

- Fix typos or clarify existing docs
- Add examples for complex features
- Improve TypeScript definitions

## Testing Guidelines

- Write tests for new functionality
- Ensure tests are descriptive and cover edge cases
- Mock external API calls
- Keep tests focused and isolated

## Commit Messages

Follow conventional commit format:

``` text
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:

``` text
feat(gemini): add retry logic for API calls

Add exponential backoff retry logic for Gemini API calls
to handle transient failures gracefully.

Closes #123
```

## Questions?

Feel free to open an issue for any questions about contributing!
