//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const date = require(__dirname + "/date.js");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://0.0.0.0:27017/todoListDB", {useNewUrlParser:true});

//schema
const itemsSchema = {
  name:String
};

 //model
 const Item=mongoose.model("Item",itemsSchema);

 //documents
 const item1= new Item({
   name:"cooking"
 });
 const item2= new Item({
   name:"cooked"
 });
 const item3= new Item({
   name:"eat"
 });

 const defaultItems=[item1,item2,item3];

//schema
 const listSchema={
   name:String,
   items:[itemsSchema]
 };
//model
const List= mongoose.model("list",listSchema);


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();  // date is module we created also the name of the file and getDate is method (file name:date.ejs)

Item.find({},(err,items)=>{  //finding DB using find to print on screen

  if(items.length===0){     // if in our DB array is empty, equal to 0 then inserting
    Item.insertMany(defaultItems,function(err){     //inserting
      if(err) console.log(err);
      else console.log("items are inserted into the items collection");
     });
     res.redirect("/");    //to display we are redirecting to home root route "/"
   }
     else{
   res.render("list", {listTitle: day, newListItems: items});   //if array (defaultItems) have data the diaplay
   }

 });
});

app.post("/", function(req, res){
    //document mongoose
  const itemName = req.body.newItem;  //grabing the userinput
  const listName = req.body.list;   //grabbing the title name through button
  console.log(listName);
    const newitem= new Item({          // creating new document
      name:itemName                    //asign the userinput to name
    });
    const day = date.getDate();
    if(listName===day){  // if its home route do this
      newitem.save();  //saving into database
      res.redirect("/");  //redirecting
    }else{
      List.findOne({name:listName}, (err, foundList)=>{  //finding the user search document
        if(err){
          console.log(err);
        }else{
          foundList.items.push(newitem);     //grabbing that doc and from that grabbing items and oushing the new document (newitem)
          foundList.save();
          res.redirect("/"+listName);     //redirecting to the custom route paramswala
        }
      });
    }

});

app.post("/delete",(req,res)=>{
  const checkedBox=req.body.checkBox;  //tapping and grabbing the checkBox value -id from array specific obj
  const listName = req.body.listName;  //tapping and grabbing the titleName
    const day = date.getDate();
  if(listName=== day){
    Item.findByIdAndRemove(checkedBox, (err)=>{  //mongoose - removing the document by id
      if(err) console.log(err);                  // if callback is not written the this method wont run ,it simply search the id
      else console.log("removed");
      res.redirect("/");
    });
  }else{ //D:usefindOneandupdate ({filter},  {update}, functon)  in update we are using $pull opertator form mongoDB to pull specific document- obj
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedBox}}},function(err){  //  The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

//  console.log(checkUncheck);

});

app.get("/:customListName",function(req,res){  //routing parameter
  const search=_.capitalize(req.params.customListName);
  // res.render(search);
  // console.log(search);
  List.findOne({name:search},(err,isThere)=>{ //(findOne) will give us an object // but (find) will give us array of object
    if(err) console.log(err);
    else if(isThere){ //what user search is already there then do this
      // console.log("exits");
      //display
      res.render("list",{listTitle: isThere.name, newListItems: isThere.items});
    }
    else{
     // console.log("doesnt exits");
     //create findOne
     const list =new List({
       name:search,
       items:defaultItems
     });
     list.save();
     res.redirect("/"+search);
   }
  });




});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(4000, function() {
  console.log("Server started on port 3000");
});
