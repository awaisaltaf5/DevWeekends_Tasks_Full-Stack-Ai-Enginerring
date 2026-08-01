# Node HTTP File Server

A basic HTTP server built entirely with Node.js built-in modules. No frameworks or external libraries are used.

## Project Purpose

This project demonstrates how to build a simple HTTP server using Node.js's native `http`, `fs`, and `path` modules. It's designed for learning purposes to understand:
- How HTTP servers work in Node.js
- Routing without frameworks
- Reading files with the `fs` module
- Request logging
- Proper HTTP status codes and headers

## Installation

1. Make sure you have Node.js installed (version 14+ recommended)
2. Navigate to the project folder:
   ```bash
   cd "Node HTTP File Server"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## How to Run

Start the server:
```bash
npm start
```

Or for development (same command in this project):
```bash
npm run dev
```

The server will start at: `http://localhost:3000`

Press `Ctrl+C` to stop the server.

## Available Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Welcome message with available routes |
| GET | `/about` | Information about the server |
| GET | `/data` | Returns data from `data.json` file |
| GET | `/other` (or any other path) | 404 Not Found response |

### Example Requests

```bash
# Welcome message
curl http://localhost:3000/

# About page
curl http://localhost:3000/about

# JSON data from file
curl http://localhost:3000/data

# 404 test
curl http://localhost:3000/unknown
```

## Node.js Modules Used

### 1. `http`
- **Purpose**: Core module for creating HTTP servers and making HTTP requests
- **Key methods used**:
  - `http.createServer()`: Creates an HTTP server instance
  - `server.listen()`: Starts the server on a specific port

### 2. `fs` (File System)
- **Purpose**: Interact with the file system
- **Key methods used**:
  - `fs.readFile()`: Reads files asynchronously (used for data.json)
  - `fs.appendFile()`: Appends data to files (used for request logging)
- **Note**: All fs operations use callbacks and are asynchronous

### 3. `path`
- **Purpose**: Work with file and directory paths in a cross-platform way
- **Key methods used**:
  - `path.join()`: Joins path segments together (handles Windows/Linux differences)

### 4. Built-in Objects Used
- `process`: Access to Node.js process (for graceful shutdown with SIGINT)
- `JSON`: Parse and stringify JSON data
- `Date`: Get current timestamp for logging

## Project Structure

```
Node HTTP File Server/
├── server.js       # Main server file with all logic
├── data.json       # Sample data file (read by /data route)
├── requests.log    # Request log file (auto-created)
├── package.json    # Project configuration and scripts
├── README.md       # This file
└── EVENT_LOOP.md   # Educational documentation about Node.js event loop
```

## Key Concepts

### HTTP Status Codes Used
- `200 OK`: Successful request
- `404 Not Found`: Route doesn't exist
- `405 Method Not Allowed`: Only GET requests are supported
- `500 Internal Server Error`: Server errors (e.g., invalid JSON)

### Response Headers
- `Content-Type`: Tells the browser what type of data is being sent
  - `text/plain` for plain text responses
  - `application/json` for JSON responses
- `charset=utf-8`: Ensures proper character encoding

### Request Logging
Every request is logged to `requests.log` with:
- Timestamp (ISO format)
- HTTP method
- URL
- Status code

Example log entry:
```
[2024-01-15T10:30:45.123Z] GET /data - Status: 200
```

### File Reading Pattern
The `fs.readFile()` uses a callback pattern (error-first):
```javascript
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    // Handle error
    return;
  }
  // Process data
});
```

## Learning Outcomes

After completing this project, you should understand:
1. How to create an HTTP server with Node.js
2. How to handle different routes
3. How to read files asynchronously
4. How to log requests to a file
5. How to set proper HTTP headers and status codes
6. Why built-in modules are powerful and sufficient for many tasks
7. How the Node.js event loop works and enables non-blocking I/O

## Additional Documentation

- **[EVENT_LOOP.md](./EVENT_LOOP.md)** - Comprehensive guide to understanding the Node.js event loop, call stack, task queue, and how asynchronous operations work in Node.js

This documentation is perfect for beginners and explains:
- What Node.js is and why it's different from traditional servers
- The event loop mechanism in simple terms
- How file system operations work asynchronously
- What happens when an HTTP request arrives
- Real examples from this project showing the complete flow

## Next Steps

To expand this project, consider adding:
- POST requests with a request body
- Static file serving (CSS, images, etc.)
- More complex routing
- Middleware pattern
- Error handling middleware
- Template engine integration (like EJS)
- API versioning
- Request validation

## License

ISC