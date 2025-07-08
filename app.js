import express from express;

const app = express;

app.get("/",function(req,res){
   console.log("Done")
})

app.listen(3000);

