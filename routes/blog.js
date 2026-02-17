const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

/* ---------- MULTER STORAGE ---------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");

    cb(null, `${Date.now()}-${cleanName}`);
  },
});

const upload = multer({ storage });

/* ---------- ROUTES ---------- */

// show add blog page
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});
router.get("/:id", async(req, res) =>{
    const blog = await Blog.findById(req.params.id).populate('createdBy');
   const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    return res.render("blog",{
        user: req.user,
        blog,
        comments,
    });
});

router.post("/comment/:blogId", async(req, res)=>{
await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
})

// create blog
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const title = req.body?.title;
    const body = req.body?.body;

    if (!title || !body) {
      return res.status(400).send("Title and body are required");
    }

    let imagePath = "/images/download.png";

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL: imagePath,
    });

    res.redirect(`/blog/${blog._id}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating blog");
  }
});

module.exports = router;
