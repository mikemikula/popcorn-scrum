Note - Still plenty of cruft to clean up, but my original intent was just to get it working again 🙃

https://github.com/user-attachments/assets/7fdb9d60-70e5-464a-b801-b0a3f3fcfeb2


# Popcorn Scrum

## Overview

This project is a Node.js application that utilizes various tools and libraries to provide a robust server-side and client-side solution. The project structure is organized to separate concerns between the server and client-side code.

## Project Structure

- **src/browser**: Contains client-side JavaScript and SCSS files.
  - `js`: JavaScript files for client-side logic.
  - `scss`: Stylesheets for the application.

- **src/server**: Contains server-side JavaScript files.
  - `controllers`: Handles HTTP requests and routes.
  - `views`: EJS templates for server-side rendering.
  - `models`: Database models and schemas.

- **apps/web**: Contains the web application code.
  - `src`: Source files for the web application.
  - `dist`: Distribution files for deployment.

- **apps/server**: Contains the server application code.
  - `src`: Source files for the server application.
  - `dist`: Distribution files for deployment.

- **packages/shared**: Contains shared code and utilities used across different parts of the application.

- **db/migrations**: Database migration files for setting up and updating the database schema.

- **config**: Configuration files for different environments (development, production, etc.).

## Key Files

- **package.json**: Contains metadata about the project and its dependencies.
- **Gruntfile.js**: Configuration for Grunt tasks.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **turbo.json**: Configuration for TurboRepo, used for managing monorepo tasks.

## Dependencies

The project relies on several Node.js packages, including but not limited to:

- **Express**: A web framework for Node.js.
- **Sequelize**: A promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server.
- **Socket.io**: A library for real-time web applications.
- **Vue.js**: A progressive JavaScript framework for building user interfaces.
- **Bootstrap**: A CSS framework for responsive design.
- **Axios**: A promise-based HTTP client for the browser and Node.js.
- **Vite**: A build tool that aims to provide a faster and leaner development experience for modern web projects.
- **TurboRepo**: A high-performance build system for JavaScript and TypeScript monorepos.

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

## Development

- **Build tools**: The project uses Grunt, Vite, and TurboRepo for task automation and building.
- **Version control**: Git is used for version control, with the main branch being `master`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any changes.

## License

This project is licensed under the MIT License.

## Contact

For any questions or issues, please contact the project maintainer at [email@example.com].
    
