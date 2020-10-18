const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();
// for using 'view engine' we need "views" folder and .ejs file into it.
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
/* we need in for static files using, and for its path.
 (Express don't serve all the files in the project automatically. It is see only
 app.js and "views" folder - app.set('view engine', 'ejs');*/
app.use(express.static("public"));

// connect mongoose to mongoDB URL and create/connect my DB - todolistDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// mongoose schema creation
const itemsSchema = ({
  name: String
});

//  mongoose model creation
const Item = mongoose.model("Item", itemsSchema);

// mongoose documents creation
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

// Schema for another lists (not default list)
const listSchema = ({
  name: String,
  items: [itemsSchema]
});

// model is collection in Robo3t that contains listSchema documents
const List = mongoose.model("List", listSchema);

// get method
app.get("/", function(req, res) {
  let day = date.getDate();
  Item.find({}, (err, items) => {
    if (err)
      console.log(err);
    else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err)
            console.log(err);
          else
            console.log("Successfully saved default items to DB.");
        });
        res.redirect("/");
      }
      // console.log(items);
      res.render("list", {
        listTitle: day,
        newListItem: items
      });
    }
  });
});

//  post method
app.post("/", function(req, res) {
  let today = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.button;
  // creating mongoose document to save in the DB after a user taping.
  const item = new Item({
    name: itemName
  });

  if (listName === today) {
    // we need the mongoose document to save the new item in the DB.
    item.save();
    // when we redirect we go back to app.get("/", ...) line;
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      // the save() method is update the foundList with the new item.
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  let today = date.getDate();
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === today) {
    // we must to provide callback function to remove part!
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log(checkedItemId + " successfully removed from DB.");
        res.redirect("/");
      } else
        console.log(err);
    });
  }
  else{
    // we get foundList after updating without item that was deleted
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) =>{
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:listTitle", (req, res) => {
  const listTitle = _.capitalize(req.params.listTitle);
  List.findOne({
    name: listTitle
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: listTitle,
          items: defaultItems
        });
        // saving the created list in the DB.
        list.save();
        res.redirect("/" + listTitle);
      } else {
        // Show the existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
    } else
      console.log(err);
  });
});

app.listen(3000, function() {
  console.log("Port 3000 is listen");
});
