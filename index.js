import dotenv from 'dotenv';
import express from "express";
import pg from "pg";

dotenv.config();

const app = express();
const port = process.env.PORT;
const API_URL = process.env.API_URL;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
}); 

db.connect(err => {
    if (err) {
        console.error('Failed to connect to the database:', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", async (req, res) => {
    const orderType = req.query.order || "created_at";
    
    try {
        let reviewResult;
        if (orderType === "read_date") {
            reviewResult = await db.query("SELECT * FROM reviews ORDER BY read_date DESC");
        } else if (orderType === "title") {
            reviewResult = await db.query("SELECT * FROM reviews ORDER BY title ASC");
        } else if (orderType === "rating") {
            reviewResult = await db.query("SELECT * FROM reviews ORDER BY rating DESC");
        } else {
            reviewResult = await db.query("SELECT * FROM reviews ORDER BY created_at DESC");
        }
        const allReviews = reviewResult.rows;
        res.render("index.ejs", { reviews: allReviews, orderType });
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).send("Server error");
    }
});

app.get("/new", (req, res) => {
    res.render("new.ejs");
});

app.get("/edit/:id", async (req, res) => {
    const reviewId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
        const review = result.rows[0];
        if (review) {
            res.render("edit.ejs", { review });
        } else {
            return res.status(404).send("Review not found");
        }
    } catch (err) {
        console.error("Error fetching review:", err);
        res.status(500).send("Server error");
    }
});

app.post("/add", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const rating = req.body.rating;
    const text = req.body.text;
    const read_date = req.body.read_date;
    const isbn = req.body.isbn;
    const book_cover = API_URL + isbn + "-L.jpg";

    try {
        await db.query("INSERT INTO reviews (title, author, book_cover, rating, text, read_date, isbn) VALUES ($1, $2, $3, $4, $5, $6, $7)", [title, author, book_cover, rating, text, read_date, isbn]);
        res.redirect("/");
    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).send("Server error");
    }
});

app.post("/update/:id", async (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const rating = req.body.rating;
    const text = req.body.text;
    const read_date = req.body.read_date;
    const isbn = req.body.isbn;
    const book_cover = API_URL + isbn + "-L.jpg";
    const reviewId = req.params.id;

    try {
        await db.query("UPDATE reviews SET title = $1, author = $2, book_cover = $3, rating = $4, text = $5, read_date = $6, isbn = $7 WHERE id = $8", [title, author, book_cover, rating, text, read_date, isbn, reviewId]);
        res.redirect("/");
    } catch (err) {
        console.error("Error updating review:", err);
        res.status(500).send("Server error");
    }
});

app.post("/delete/:id", async (req, res) => {
    const reviewId = req.params.id;

    try {
        await db.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).send("Server error");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});