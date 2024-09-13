import axios from "axios";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import express from "express";
import pg from "pg";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BookReviews",
    password: process.env.DB_PASSWORD,
    port: 5432,
});
  
db.connect();
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const reviewResult = await db.query("SELECT * FROM reviews");
        const allReviews = reviewResult.rows;
        console.log(allReviews);
        res.render("index.ejs", { reviews: allReviews});
    } catch (err) {
        console.log(err);
    }
});

app.get("/new", (req, res) => {
    res.render("new.ejs");
})

app.get("/edit/:id", async (req, res) => {
    const reviewId = req.params.id;
    const result = await db.query("SELECT * FROM reviews WHERE id = $1", [reviewId]);
    const review = result.rows[0];
    console.log(review);
    res.render("edit.ejs", { review: review});
}); 

app.post("/add", async (req, res) => {
    console.log(req.body);
    try {
        const title = req.body.title;
        const author = req.body.author;
        const book_cover = API_URL + req.body.isbn + "-L.jpg";
        const rating = req.body.rating;
        const text = req.body.text;
        const read_date = req.body.read_date;
        await db.query("INSERT INTO reviews (title, author, book_cover, rating, text, read_date) VALUES($1, $2, $3, $4, $5, $6)", [title, author, book_cover, rating, text, read_date]);
        res.redirect("/");
    } catch (err){
        console.log(err);
    }
})

app.post("/update/:id", async (req, res) => {
    try {
        const title = req.body.title;
        const author = req.body.author;
        const book_cover = API_URL + req.body.isbn + "-S.jpg";
        const rating = req.body.rating;
        const text = req.body.text;
        const read_date = req.body.read_date;
        const reviewId = req.params.id;
        await db.query("UPDATE reviews SET title = $1, author = $2, book_cover = $3, rating = $4, text = $5, read_date = $6 WHERE id = $7",[title, author, book_cover, rating, text, read_date, reviewId]);
        res.redirect("/");
    } catch (err){
        console.log(err);
    }
})

app.post("/delete/:id", async (req, res) => {
    console.log(req.params);
    try {
        const reviewId = req.params.id;
        await db.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
