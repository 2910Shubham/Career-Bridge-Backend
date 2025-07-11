import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

const app = express();

app.get("/", function(req, res) {
   console.log("Done");
   res.send("Server is running!");
});


app.listen(process.env.PORT || 3000, () => {
   console.log(`Server started on port ${process.env.PORT || 3000}`);
});

