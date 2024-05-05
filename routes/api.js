/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Schema = mongoose.Schema;
const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    comments: { type: [String], default: [] },
    commentcount: { type: Number, default: 0 },
  },
  { versionKey: false },
);

let Book = mongoose.model("Book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find()
        .select({ _id: 1, title: 1, commentcount: 1 })
        .exec((err, booksFound) => {
          if (err) return console.log(err);
          return res.json(booksFound);
        });
    })

    .post(function (req, res) {
      let title = req.body.title;
      if (!title) {
        return res.send("missing required field title")
      }
      //response will contain new book object including atleast _id and title
      let newBook = new Book({
        title: title,
        comments: [],
        commentcount: 0,
      });
      newBook.save((err, createdBook) => {
        if (err) return console.log(err);
        return res.json({ _id: createdBook._id, title: createdBook.title });
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, booksDeleted) => {
        if (err) return console.log(err);
        return res.send("complete delete successful")
      })
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(req.params.id, '_id title comments', (err, bookFound) => {
        if (err) return console.log(err);
        if (!bookFound) {
          return res.send('no book exists')
        }
        return res.send(bookFound);
      })
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!req.body.comment) {
        return res.send("missing required field comment");
      }
      Book.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: req.body.comment } , $inc: { commentcount: 1 } }, 
        { new: true },
        (err, bookFound) => {
          if (err) return console.log(err);
          if (!bookFound) {
            return res.send("no book exists");
          }
          return res.send({
            _id: bookFound._id,
            title: bookFound.title,
            comments: bookFound.comments
          })
        },
      );
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, (err, bookDeleted) => {
        if (err) return console.log(err);
        if (!bookDeleted) {
          return res.send("no book exists");
        }
        return res.send("delete successful")
      })
    });

    let slowHorses = [
      {title: "Slow Horses", comments: ["Introduces Lamb, Catherine, River, Roddy, Louisa, Min, Sid", "Sid dies (?)"], commentcount: 2},
      {title: "Dead Lions", comments: ["Introduces Shirley and Marcus", " Min dies"], commentcount: 2},
      {title: "Real Tigers", comments: [], commentcount: 0},
      {title: "Spook Street", comments: ["Introduces Coe", "Marcus dies"], commentcount: 2},
      {title: "London Rules", comments: [], commentcount: 0},
      {title: "Joe Country", comments: ["Lech introduced", "Coe dies"], commentcount: 2},
      {title: "Slough House", comments: ["Sid returns but both Sid and River 'die'"], commentcount: 1},
      {title: "Bad Actors", comments: ["Ashley Khan joins", "River absent but return teased"], commentcount: 1}
  
    ]

    app
      .route("/api/slowhorses")
      .get((req, res) => {
        Book.create(slowHorses, {ordered: true}, (err, booksCreated) => {
          if (err) return console.log(err);
          return res.json(booksCreated)
        })
      })
};
