const authentication = require ("./src/authentication/index")
const express = require("express")
var app = express()
app.use (authentication)
app.get("/",function(request,response){
response.send("Hello World!")
})
app.listen(3000, function () {
console.log("Started application on port %d", 3000)
});
