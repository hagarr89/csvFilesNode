import * as express from "express";
import * as multer from "multer";
import * as csv from "fast-csv";
import * as fs from "fs";

const CONST_kEYS_NUMBERS = ["kwh", "pressure", "tepm"];
const app = express();
const port = 3001;

declare global {
  namespace NodeJS {
    interface Global {
      __basedirTS: string;
    }
  }
}

global.__basedirTS = __dirname;

// Configuring Multer for File Uploads:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, global.__basedirTS + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const csvFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: any
) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

app.post(
  "/api/upload-csv-file",
  upload.single("file"),
  (req: express.Request, res: express.Response) => {
    try {
      if (req.file == undefined) {
        return res.status(400).send({
          message: "Please upload a CSV file!",
        });
      }

      let csvData: any[] = [];
      let filePath = global.__basedirTS + "/uploads/" + req?.file?.filename;

      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .on("error", (error) => {
          throw error.message;
        })
        .on("data", (row) => {
          const allKeys = Object.keys(row);
          const newRow = allKeys.reduce((acc, key) => {
            if(CONST_kEYS_NUMBERS.includes(key)){
              return { ...acc, [key]: Number(row[key]) };
            } else {
              return {...acc ,[key]:row[key]};
            }
          }, {});
          csvData.push(newRow);
        })
        .on("end", () => {
          // You can process the parsed CSV data here
          res.status(200).send({
            message: "CSV data parsed successfully: " + req?.file?.originalname,
            data: csvData,
          });
        });
    } catch (error) {
      res.status(500).send({
        message: "Could not upload the file: " + req?.file?.originalname,
        error: error,
      });
    }
  }
);
app.get("/api/get-csv-data", (req, res) => {
  try {
    let filePath =
      global.__basedirTS + "/uploads/file-1622000650050-employees.csv"; // Replace with the actual filename

    let csvData: any[] = [];

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
  } catch (error) {
    res.status(500).send({
      message: "Could not fetch the CSV data.",
    });
  }
});
let server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
