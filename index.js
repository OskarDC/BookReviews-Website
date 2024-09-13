import axios from "axios";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import express from "express";
import pg from "pg";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "permalist",
    password: process.env.DB_PASSWORD,
    port: 5432,
});
  
db.connect();
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
