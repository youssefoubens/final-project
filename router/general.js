const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');

// Function to verify JWT token and extract username
function verifyToken(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.username = decoded.username;
        next();
    });
}

public_users.post('/register', (req, res) => {
    // Extract username and password from the request body
    const username = req.body.username;
const password = req.body.password;
    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if the username already exists
    if (users.hasOwnProperty(username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    // Register the new user
    users[username] = password;

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully' });
});

public_users.post('/customer/login', (req, res) => {
    // Extract username and password from the request body
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if the username exists in the registered users
    if (!users.hasOwnProperty(username)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if the provided password matches the registered password
    if (users[username] !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // If username and password are valid, respond with success message
    res.status(200).json({ message: 'Login successful' });
});

public_users.get('/', function (req, res) {
    // Retrieve the list of books from the database
    const bookList = Object.values(books);

    // Check if there are books in the list
    if (bookList.length === 0) {
        return res.status(404).json({ message: "No books available" });
    }

    // If books are available, send the list as a JSON response
    res.status(200).json({ books: bookList });
});

public_users.get('/isbn/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Find the book with the given ISBN from the book list
    const book = Object.values(books).find(book => book.isbn === isbn);

    // Check if the book is found
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // If the book is found, send the book details as a JSON response
    res.status(200).json({ book: book });
});

public_users.get('/author/:author', function (req, res) {
    // Retrieve the author from the request parameters
    const author = req.params.author;

    // Get all the keys for the 'books' object
    const bookKeys = Object.keys(books);

    // Initialize an array to store books by the provided author
    const booksByAuthor = [];

    // Iterate through the 'books' array & check if the author matches the one provided in the request parameters
    bookKeys.forEach(key => {
        const book = books[key];
        if (book.author === author) {
            booksByAuthor.push(book);
        }
    });

    // Check if any books are found for the provided author
    if (booksByAuthor.length === 0) {
        return res.status(404).json({ message: 'No books found for the provided author' });
    }

    // If books are found, send the book details as a JSON response
    res.status(200).json({ books: booksByAuthor });
});

public_users.get('/title/:title', function (req, res) {
    // Retrieve the title from the request parameters
    const title = req.params.title;

    // Initialize an array to store books with the provided title
    const booksWithTitle = [];

    // Iterate through the books object to find books with the provided title
    Object.values(books).forEach(book => {
        if (book.title === title) {
            booksWithTitle.push(book);
        }
    });

    // Check if any books are found for the provided title
    if (booksWithTitle.length === 0) {
        return res.status(404).json({ message: 'No books found for the provided title' });
    }

    // If books are found, send the book details as a JSON response
    res.status(200).json({ books: booksWithTitle });
});


public_users.get('/review/:isbn', function (req, res) {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;

    // Find the book with the given ISBN from the book list
    const book = Object.values(books).find(book => book.isbn === isbn);

    // Check if the book is found
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the book has reviews
    if (!book.reviews || Object.keys(book.reviews).length === 0) {
        return res.status(404).json({ message: 'No reviews found for the book' });
    }

    // If the book has reviews, send the reviews as a JSON response
    res.status(200).json({ reviews: book.reviews });
});

public_users.post('/review', verifyToken, (req, res) => {
    // Extract review and ISBN from the request query parameters
    const { review, isbn } = req.query;

    // Check if review and ISBN are provided
    if (!review || !isbn) {
        return res.status(400).json({ message: 'Review and ISBN are required' });
    }

    // Check if the book with the given ISBN exists
    if (!books.hasOwnProperty(isbn)) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the user has already posted a review for the same ISBN
    if (books[isbn].reviews.hasOwnProperty(req.username)) {
        // Modify the existing review
        books[isbn].reviews[req.username] = review;
        return res.status(200).json({ message: 'Review updated successfully' });
    } else {
        // Add the review
        books[isbn].reviews[req.username] = review;
        return res.status(201).json({ message: 'Review added successfully' });
    }
});

public_users.post('/review/add', verifyToken, (req, res) => {
  // Extract review and ISBN from the request query parameters
  const { review, isbn } = req.query;

  // Check if review and ISBN are provided
  if (!review || !isbn) {
      return res.status(400).json({ message: 'Review and ISBN are required' });
  }

  // Check if the book with the given ISBN exists
  if (!books.hasOwnProperty(isbn)) {
      return res.status(404).json({ message: 'Book not found' });
  }

  // Check if the user has already posted a review for the same ISBN
  if (books[isbn].reviews.hasOwnProperty(req.username)) {
      // Modify the existing review
      books[isbn].reviews[req.username] = review;
      return res.status(200).json({ message: 'Review updated successfully' });
  } else {
      // Add the review
      books[isbn].reviews[req.username] = review;
      return res.status(201).json({ message: 'Review added successfully' });
  }
});


const axios = require('axios');

async function fetchBookList() {
    try {
        const response = await axios.get('http://localhost:5000/');
        return response.data.books;
    } catch (error) {
        console.error('Error fetching book list:', error.response.data.message);
        throw error;
    }
}




async function fetchBookDetailsByISBN(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return response.data.book;
    } catch (error) {
        console.error(`Error fetching book details for ISBN ${isbn}:`, error.response.data.message);
        throw error;
    }
}
async function fetchBooksByAuthor(author) {
  try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return response.data.books;
  } catch (error) {
      console.error(`Error fetching books by author ${author}:`, error.response.data.message);
      throw error;
  }
}
async function fetchBooksByTitle(title) {
  try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return response.data.books;
  } catch (error) {
      console.error(`Error fetching books by title ${title}:`, error.response.data.message);
      throw error;
  }
}
module.exports.fetchBooksByAuthor = fetchBooksByAuthor;
module.exports.fetchBookDetailsByISBN = fetchBookDetailsByISBN;

module.exports.fetchBookList = fetchBookList;

module.exports.general = public_users;
