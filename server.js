// https://noteforge2.onrender.com/

import http from "http";
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

// Set up MongoDB client
const uri = "mongodb+srv://kevin:garcia@noteforgedb.nxjxdg7.mongodb.net/?appName=NoteForgeDB"
const client = new MongoClient(uri); // Set up MongoDB Client

// Connect to MongoDB Database and retrieve plans
let planCollection;
async function connectDB() {
    try {
        await client.connect();
        planCollection = client.db("PlanDB").collection("PlanCollection");
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("MongoDB Connection failed: " + e);
        process.exit(1);
    }
}

// Easy to update paths
const PAGES = path.resolve("./html");
const STYLES = path.resolve("./styles");
const SCRIPTS = path.resolve("./scripts");
const IMAGES = path.resolve("./images");

// Tightly regulated access to files
const ALLOWEDREQUESTS = {
    STYLES: [
        "/global.css",
        "/header.css",
        "/getStarted.css",
        "/features.css",
        "/pricing.css",
        "/testimonials.css",
        "/footer.css",
        "/responsiveness.css"

    ],
    SCRIPTS: [
        "/main.js"
    ],
    IMAGES: [
        "/mbr-1-816x544.jpg",
        "/mbr-2-816x544.jpg",
        "/mbr-91x114.png",
        "/mbr-816x544.jpg",
        "/mbr-1256x837.jpg",
        "/team1.jpg",
        "/team2.jpg",
        "/team3.jpg",
        "/team4.jpg",
        "/team6.jpg"
    ],
    DATA: [
        "/api"
    ],
    PAGES: [
        "/"
    ]
};


const PORT = process.env.PORT || 4000;


function requestStyle(req, res) {
    console.log(`Requested Style:  ${req.url}`);

    const filePath = path.join(STYLES, req.url);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.writeHead(200, { "Content-Type" : "text/css" });
            res.end(data);
        };
    });
};


function requestScript(req, res) {
    console.log(`Requested Script: ${req.url}`);

    const filePath = path.join(SCRIPTS, req.url);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.writeHead(200, { "Content-Type" : "application/javascript" });
            res.end(data);
        };
    });
};


async function requestData(req, res) {
    console.log(`Requested Data:   ${req.url}`);

    switch (req.url) {
        case "/api":
            planCollection.find({}).toArray().then(
            (results) => {
                res.writeHead(200, { "Content-Type" : "application/json" });
                res.end(JSON.stringify(results));
            }).catch(
                (err) => {
                    res.writeHead(500, { "Content-Type" : "application/json" });
                    res.end(JSON.stringify({ error: "Failed to fetch the plans" }))
                })
            break;
    }
}


function requestImage(req, res) {
    console.log(`Requested Image:  ${req.url}`)

    const filePath = path.join(IMAGES, req.url);
    const stream = fs.createReadStream(filePath);

    res.writeHead(200, { "Content-Type" : "image/png" });
    stream.pipe(res);
}


function requestPage(req, res) {
    console.log(`Requested Page:   ${req.url}`);

    const filePath = path.join(PAGES, (req.url === "/") ? "index.html" : `${req.url}.html`);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.writeHead(200, { "Content-Type" : "text/html" });
            res.end(data);
        };
    });
};


const server = http.createServer((req, res) => {
    // Easier to add many new files/requests in the future if I have to 
    if (ALLOWEDREQUESTS.STYLES.includes(req.url)) { requestStyle(req, res); }
    else if (ALLOWEDREQUESTS.SCRIPTS.includes(req.url)) { requestScript(req, res); }
    else if (ALLOWEDREQUESTS.IMAGES.includes(req.url)) { requestImage(req, res); }
    else if (ALLOWEDREQUESTS.DATA.includes(req.url)) { requestData(req, res); }
    else if (ALLOWEDREQUESTS.PAGES.includes(req.url)) { requestPage(req, res); }
});

// Check connection to database before starting the server
connectDB().then(() => { server.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); });
