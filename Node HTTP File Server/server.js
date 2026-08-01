// ============================================
// Node.js HTTP File Server
// A basic HTTP server using ONLY built-in modules
// ============================================

// Import the built-in 'http' module
// The http module allows us to create HTTP servers and make HTTP requests
const http = require('http');

// Import the built-in 'fs' module
// The fs module allows us to work with the file system (read/write files)
const fs = require('fs');

// Import the built-in 'path' module
// The path module provides utilities for working with file and directory paths
const path = require('path');

// ============================================
// Configuration
// ============================================
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const LOG_FILE = path.join(__dirname, 'requests.log');

// ============================================
// Helper: Write request log
// ============================================

/**
 * Logs each request to a file with timestamp
 * Uses fs.appendFile to add to the log without overwriting
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 */
function logRequest(method, url, statusCode) {
  // Create a log entry with timestamp
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${method} ${url} - Status: ${statusCode}\n`;

  // Append the log entry to the log file
  // 'a' flag means append mode - adds to the end of the file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// ============================================
// Helper: Read data from JSON file
// ============================================

/**
 * Reads and parses the local JSON data file
 * @returns {Promise<Object>} Parsed JSON data
 */
function readDataFile() {
  return new Promise((resolve, reject) => {
    // Read the file asynchronously
    // 'utf8' encoding ensures we get a string back instead of a Buffer
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        // If file not found, reject with 404-like error
        reject({ statusCode: 404, message: 'Data file not found' });
        return;
      }

      try {
        // Parse the JSON string into a JavaScript object
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (parseError) {
        // If JSON is invalid, reject with 500 error
        reject({ statusCode: 500, message: 'Invalid JSON in data file' });
      }
    });
  });
}

// ============================================
// Route Handlers
// ============================================

/**
 * Handles the home route (GET /)
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
function handleHome(req, res) {
  // Set HTTP status code: 200 means "OK"
  res.statusCode = 200;

  // Set Content-Type header to tell the browser we're sending plain text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // Send a welcome message
  const message = 'Welcome to Node HTTP File Server!\n\n' +
    'Available routes:\n' +
    '  GET /      - This welcome message\n' +
    '  GET /about - About this server\n' +
    '  GET /data  - Read data from local JSON file\n';

  res.end(message);
}

/**
 * Handles the about route (GET /about)
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
function handleAbout(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const aboutMessage = 'Node HTTP File Server\n' +
    'Version: 1.0.0\n' +
    'Built with: Node.js built-in modules only (http, fs, path)\n' +
    'No frameworks or external libraries used!\n' +
    'Purpose: Learning Node.js HTTP server basics\n';

  res.end(aboutMessage);
}

/**
 * Handles the data route (GET /data)
 * Reads and returns data from data.json
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
async function handleData(req, res) {
  try {
    // Read the data from the JSON file
    const data = await readDataFile();

    // Success: send the data as JSON
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Convert JavaScript object to JSON string
    const jsonResponse = JSON.stringify(data, null, 2);
    res.end(jsonResponse);
  } catch (error) {
    // Handle errors
    res.statusCode = error.statusCode || 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const errorResponse = JSON.stringify({
      error: true,
      message: error.message || 'Internal Server Error'
    });
    res.end(errorResponse);
  }
}

/**
 * Handles 404 - Not Found
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
function handleNotFound(req, res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const notFoundResponse = JSON.stringify({
    error: true,
    message: 'Route not found',
    path: req.url,
    availableRoutes: ['/', '/about', '/data']
  });

  res.end(notFoundResponse);
}

// ============================================
// Create HTTP Server
// ============================================

// The createServer method creates a new HTTP server
// It takes a callback function that is called for each incoming request
// req (request) contains information about the incoming request
// res (response) is used to send data back to the client
const server = http.createServer(async (req, res) => {
  // Get the HTTP method and URL from the request
  const method = req.method;
  const url = req.url;

  // Log the request immediately (before handling)
  console.log(`${method} ${url}`);

  // Route matching: decide which handler to use based on the URL
  // We only handle GET requests in this simple server
  if (method === 'GET') {
    switch (url) {
      case '/':
        // Call the home handler
        await handleHome(req, res);
        break;

      case '/about':
        // Call the about handler
        await handleAbout(req, res);
        break;

      case '/data':
        // Call the data handler (async because it reads a file)
        await handleData(req, res);
        break;

      default:
        // Any other URL returns 404
        await handleNotFound(req, res);
    }
  } else {
    // We only support GET requests
    // Return 405 Method Not Allowed for other methods
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      error: true,
      message: 'Method not allowed. Only GET requests are supported.'
    }));
  }

  // Log the request to file after handling (with status code)
  logRequest(method, url, res.statusCode);
});

// ============================================
// Start the Server
// ============================================

// The listen method starts the server and makes it accept connections
// on the specified port
server.listen(PORT, () => {
  // This callback runs when the server has started successfully
  console.log('='.repeat(50));
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\nAvailable routes:');
  console.log(`  GET http://localhost:${PORT}/      - Welcome message`);
  console.log(`  GET http://localhost:${PORT}/about - About message`);
  console.log(`  GET http://localhost:${PORT}/data  - JSON data from file`);
  console.log(`  GET http://localhost:${PORT}/other - 404 Not Found (test)`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

// ============================================
// Graceful Shutdown
// ============================================

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// ============================================
// Key Concepts Explained:
// ============================================
/*
1. http.createServer(): Creates an HTTP server that listens for requests
2. req (request): Contains info about the incoming request (URL, method, headers, etc.)
3. res (response): Used to send data back to the client
4. res.statusCode: HTTP status code (200=OK, 404=Not Found, 500=Server Error)
5. res.setHeader(): Sets response headers (Content-Type, etc.)
6. res.end(): Ends the response and sends data to the client
7. fs.readFile(): Asynchronously reads a file from the filesystem
8. fs.appendFile(): Appends data to a file (used for logging)
9. Async/Await: Used for handling asynchronous operations cleanly
10. Callbacks: Node.js uses callbacks for async operations (error-first pattern)
*/