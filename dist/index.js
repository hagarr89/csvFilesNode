"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");
const app = express();
const port = 3001;
global.__basedirTS = __dirname;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, global.__basedirTS + "/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    },
});
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    }
    else {
        cb("Please upload only csv file.", false);
    }
};
const upload = multer({ storage: storage, fileFilter: csvFilter });
app.post("/api/upload-csv-file", upload.single("file"), (req, res) => {
    var _a, _b;
    try {
        if (req.file == undefined) {
            return res.status(400).send({
                message: "Please upload a CSV file!",
            });
        }
        let csvData = [];
        let filePath = global.__basedirTS + "/uploads/" + ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
            throw error.message;
        })
            .on("data", (row) => {
            csvData.push(row);
        })
            .on("end", () => {
            var _a;
            // You can process the parsed CSV data here
            res.status(200).send({
                message: "CSV data parsed successfully: " + ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.originalname),
                data: csvData,
            });
        });
    }
    catch (error) {
        res.status(500).send({
            message: "Could not upload the file: " + ((_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.originalname),
            error: error,
        });
    }
});
app.get("/api/get-csv-data", (req, res) => {
    try {
        let filePath = global.__basedirTS + "/uploads/file-1622000650050-employees.csv"; // Replace with the actual filename
        let csvData = [];
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
            throw error.message;
        })
            .on("data", (row) => {
            csvData.push(row);
        })
            .on("end", () => {
            res.status(200).send({
                message: "CSV data fetched successfully.",
                data: csvData,
            });
        });
    }
    catch (error) {
        res.status(500).send({
            message: "Could not fetch the CSV data.",
        });
    }
});
let server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
