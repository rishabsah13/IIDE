const express = require("express");

const { google } = require("googleapis");
const { json } = require("body-parser");

const app = express();
app.use(express.json());

app.listen(3000, () => console.log("server running on port 3000"));
const id = "1x6_nBJSMmIxtmWUP26C_PPAUjRR-VCP4DAwRwWHLZyw";

const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const sheets = google.sheets({ version: "v4", auth: client });
  return { sheets };
};
app.get("/", async (req, res) => {
  try {
    const { sheets } = await authentication();
    // const id = "1x6_nBJSMmIxtmWUP26C_PPAUjRR-VCP4DAwRwWHLZyw";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: "Sheet1",
    });
    res.send(response.data);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.post("/", async (req, res) => {
  try {
    const { newName, newValue } = req.body;
    const { sheets } = await authentication();
    const writeReq = await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[newName, newValue]],
      },
    });
    if (writeReq.status === 200) {
      return res.json({ msg: "Spreadsheet updated successfully" });
    }
    return res.json({ msg: "something went wrong" });
  } catch (e) {
    console.log("error updating the sheet", e);
    res.status(500).send();
  }
});
