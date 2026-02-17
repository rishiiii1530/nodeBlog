require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT|| 8002;

/* ---------------- DATABASE ---------------- */
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo error:", err));

/* ---------------- VIEW ENGINE ---------------- */
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ---------------- GLOBAL MIDDLEWARE ---------------- */
app.use(express.urlencoded({ extended: false })); // form parser
app.use(cookieParser());                           // read cookies
app.use(checkForAuthenticationCookie("token"));    // attach req.user
app.use(express.static(path.resolve("./public"))); // images/css/js

/* ---------------- ROUTES ---------------- */

// Home page
app.get("/", async (req, res) => {
    try {
        const allBlogs = await Blog.find({}).sort({ createdAt: -1 });

        res.render("home", {
            user: req.user || null,
            blogs: allBlogs || [],
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Feature routes
app.use("/user", userRoute);
app.use("/blog", blogRoute);

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) => {
    res.status(404).send("Page not found");
});

/* ---------------- SERVER ---------------- */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
