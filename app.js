// modules
const _ = require('dotenv').config(); 
const path = require('path');
const exphbs = require('express-handlebars');
const express = require('express');

const mongoConnector = require('./src/models/db.js');
const router = require('./src/routes/router.js');

const app = express();


async function connectToDB (){
    try {
        mongoConnector();
        console.log(`Now connected to DB`);

    } catch (err){
        console.log(`Connection to DB failed`)
        console.log(err);
    }

}


function initializeHandlebars() {
    app.engine("hbs", exphbs.engine({
        extname: "hbs",
        defaultLayout: false,
    }));
    app.set("view engine", "hbs");
    app.set("views", "./src/views");
}



function initializeStaticFolders() {
    app.use(express.static(path.join(__dirname, 'public')));

}

async function main() {
    initializeStaticFolders();
    initializeHandlebars();

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(router);
    // use routing file

    app.listen(process.env.SERVER_PORT, connectToDB());
     
}

main()