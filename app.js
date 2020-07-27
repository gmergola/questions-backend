/** Express app for family-feud. */

const express = require("express");
const Question = require("./models/questions");
const ExpressError = require("./expressError");
const app = express();
const cors = require("cors");

// allow json body parsing
app.use(express.json());

// allow connections to all routes from any browser
app.use(cors());

/**get all questions */
app.get("/questions", async function (req, res, next) {
  try {
    const result = await Question.getAll();
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
});

/**get one question with all its answers and votes */
app.get("/questions/:question_main", async function (req, res, next) {
  try {
    const result = await Question.get(req.params.question_main);
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
});

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;