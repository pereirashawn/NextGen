const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const path = require("path");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");

const adminRoutes = require("./routes/admin");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/error");

const User = require('./models/user')

require("dotenv").config();

const app = express();

// MongoDB Store
const store = new MongoDbStore({
  uri: process.env.DB_URL,
  collection: "sessions",
});

const csrfProtection = csrf();

// Setting Template Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

//Static files
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

// connect-flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.name = req.session.isLoggedIn ? req.session.user.name : "Guest";
  res.locals.loggedInUser = req.session.user
  res.locals.csrfToken = req.csrfToken();
  // console.log("admin: " + res.locals.isAdmin);
  // console.log("auth: " + res.locals.isAuthenticated);
  next();
});

app.use((req, res, next) => {
  if (req.session.isLoggedIn) {
    req.session.user = new User().init(req.session.user);
  }
  next();
});

// Middlewares
app.use("/admin", adminRoutes);
app.use(homeRoutes);
app.use(authRoutes);

app.get("/500", errorController.error500);

app.get("/401", errorController.forbiddenError);

// 404 Error Page Middleware
app.use(errorController.error404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("errors/error500", {
    pageTitle: "ERROR!!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    message: error.message,
  });
});

mongoose
  .connect(process.env.DB_URL)
  .then((result) => {
    console.log("CONNECTED TO DATABASE");
    // https.createServer({
    //   key: privateKey,
    //   cert: certificate
    // },app).listen(process.env.PORT || 3000)

    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
