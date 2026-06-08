const express = require('express')
const mongoose = require('mongoose')
const app = express()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

////////////////////////////////////////////////
const Message = require('./model/message')
const Iteam = require('./model/iteam')
const Cart = require('./model/cart')
const Order = require('./model/order')
const Pass = require('./model/passAdmin')
const Seting = require('./model/seting')
const Categore = require('./model/categore')
////////////////////////////////////////////////

const cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid')
app.use(cookieParser())

const session = require('express-session')

const http = require("http")
const { Server } = require("socket.io")

const server = http.createServer(app)





////////////////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////////////////









const io = new Server(server, {
  cors: { origin: "*" }
})

app.set("io", io)

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id)
  })
})

////////////////////////////////////////////////

app.use(session({
  secret: 'superSecret123!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}))

function isAdmin(req, res, next) {
  if(req.session.isAdmin) {
    return next()
  }
  res.redirect('/c0f3l09')
}

app.use((req, res, next) => {
  if (!req.cookies.sessionId) {
    res.cookie('sessionId', uuidv4(), { maxAge: 1000 * 60 * 60 * 24 })
  }
  next()
})

////////////////////////////////////////////////
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.fieldname === "logo") {
      cb(null, "public/uploads/logo")
    }

    else if (file.fieldname === "picture") {
      cb(null, "public/uploads/products")
    }

    else if (file.fieldname === "cafePicture") {
      cb(null, "public/uploads/cafe")
    }

  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

////////////////////////////////////////////////

const dbURI = 'mongodb://admin:gzUNmn96F5MoveQgMgDr@coffee-fje-service:27017/admin'
// const dbURI = 'mongodb://localhost:27017/cofe'

const PORT = process.env.PORT || 3000

app.set('view engine' , 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

////////////////////////////////////////////////

mongoose.connect(dbURI)
.then(() => {

    console.log('DB is connected ✅')

    server.listen(PORT , () => {
      console.log(`Server running on port ${PORT} 🚀`)
    })

})
.catch((err) => {
    console.log(`connection lost !!! ${err}`)
})



app.use(async (req, res, next) => {
  try {
    const setings = await Seting.findOne().sort({ _id: -1 });

    const defaultSetings = {
      title: "",
      description: "",
      features: "",
      phone: "",
      address: "",
      instagram: "",
      telegram: "",
      cafePicture: []   // مهم
    };

    res.locals.setings = {
      ...defaultSetings,
      ...(setings ? setings.toObject() : {})
    };

    next();
  } catch (err) {
    next(err);
  }
});


app.use((req, res, next) => {

  if (req.body) {

    Object.keys(req.body).forEach(key => {

      if (req.body[key] === undefined || req.body[key] === null) {
        req.body[key] = "";
      }

      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }

    });

  }

  next();

});


app.get('/', (req, res, next) => {
  Promise.all([
    Iteam.find().populate('categore'),
  ])
    .then(([iteams]) => {
      res.render('index.ejs', { iteams });
    })
    .catch(next);
});

app.post('/admin', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'picture', maxCount: 1 },
  { name: 'cafePicture', maxCount: 4 }
]), async (req, res) => {


  const action = req.body.action;

  if (action === 'iteam') {

    const productImage = req.files?.picture?.[0];

    const newItem = new Iteam({
      iteamName: req.body.iteamName,
      price: req.body.price,
      about: req.body.about,
      categore: req.body.categore,
      picture: productImage
      ? `/uploads/products/${productImage.filename}`
      : ''
    
    });

    await newItem.save();
    return res.redirect('/admin');
  }

  if (action === 'setings') {

    const logoFile = req.files?.logo?.[0];
    const cafePicFiles = req.files?.cafePicture || [];
  
    const newSeting = new Seting({
      ...req.body,
  
      logo: logoFile
        ? `/uploads/logo/${logoFile.filename}`
        : '',
  
      cafePicture: cafePicFiles.map(file =>
        `/uploads/cafe/${file.filename}`
      )
  
    });
  
    await newSeting.save();
  
    return res.redirect('/admin');
  }


  if (action === 'categore') {

    const newCategore = new Categore({
      name: req.body.name,
      mother: req.body.mother
    });

    await newCategore.save();
    return res.redirect('/admin');
  }
  

});






app.get('/about_us' , (req , res) => {
    res.render('aboutUs.ejs')
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function isAjax(req) {
  return (req.get('X-Requested-With') || '').toLowerCase() === 'xmlhttprequest';
}
function wantsJSON(req) {
  const acc = (req.get('Accept') || '').toLowerCase();
  return isAjax(req) || acc.includes('application/json');
}
function parsePrice(v) {
  if (typeof v === 'number') return v;
  const s = String(v || '0');
  return Number(s.replace(/[^\d]/g, '')) || 0;
}
function buildCartSummary(cart) {
  const items = cart
    ? cart.items.map(i => ({
        itemId: String(i._id),
        productId: i.productId?._id ? String(i.productId._id) : null,
        name: i.productId?.iteamName || '',
        price: parsePrice(i.productId?.price),
        quantity: i.quantity || 0,
        picture: i.productId?.picture || null
      }))
    : [];

  const totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  const totalPrice = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
  return { items, totalQty, totalPrice };
}


app.get('/cart', async (req, res) => {
  const sessionId = req.cookies.sessionId;

  try {
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');

    const cartItems = cart
      ? cart.items.map(i => ({
          _id: i._id, 
          productId: i.productId?._id, 
          name: i.productId?.iteamName || '',
          price: parsePrice(i.productId?.price || 0),
          quantity: i.quantity || 0,
          picture: i.productId?.picture || null
        }))
      : [];


    res.render('cart.ejs', { cartItems });
  } catch (err) {
    console.error(err);
    res.render('cart.ejs', { cartItems: [] });
  }
});


app.get('/cart/summary', async (req, res) => {
  const sessionId = req.cookies.sessionId;

  try {
    const cart = await Cart.findOne({ sessionId }).populate('items.productId');
    return res.json(buildCartSummary(cart));
  } catch (err) {
    console.error(err);
    return res.json({ items: [], totalQty: 0, totalPrice: 0 });
  }
});


app.post('/cart/add/:id', async (req, res) => {
  const productId = req.params.id;
  const sessionId = req.cookies.sessionId;

  try {
    let cart = await Cart.findOne({ sessionId });
    if (!cart) cart = new Cart({ sessionId, items: [] });

    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();

    if (wantsJSON(req)) {
      const populated = await Cart.findOne({ sessionId }).populate('items.productId');
      return res.json(buildCartSummary(populated));
    }

    return res.redirect('/cart');
  } catch (err) {
    console.error(err);
    if (wantsJSON(req)) return res.status(500).json({ error: 'خطا در افزودن به سبد خرید' });
    return res.redirect('/');
  }
});


app.post('/cart/decrease/:productId', async (req, res) => {
  const productId = req.params.productId;
  const sessionId = req.cookies.sessionId;

  try {
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      if (wantsJSON(req)) return res.json({ items: [], totalQty: 0, totalPrice: 0 });
      return res.redirect('back');
    }

    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (!existingItem) {
      if (wantsJSON(req)) {
        const populated = await Cart.findOne({ sessionId }).populate('items.productId');
        return res.json(buildCartSummary(populated));
      }
      return res.redirect('back');
    }

    existingItem.quantity = (existingItem.quantity || 0) - 1;

    if (existingItem.quantity <= 0) {
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    }

    await cart.save();

    if (wantsJSON(req)) {
      const populated = await Cart.findOne({ sessionId }).populate('items.productId');
      return res.json(buildCartSummary(populated));
    }

    return res.redirect('back');
  } catch (err) {
    console.error(err);
    if (wantsJSON(req)) return res.status(500).json({ error: 'خطا در کم کردن از سبد خرید' });
    return res.redirect('back');
  }
});


app.post('/cart/delete/:itemId', async (req, res) => {
  const itemId = req.params.itemId;
  const sessionId = req.cookies.sessionId;

  try {
    await Cart.updateOne(
      { sessionId, 'items._id': itemId },
      { $inc: { 'items.$.quantity': -1 } }
    );

    await Cart.updateOne(
      { sessionId },
      { $pull: { items: { _id: itemId, quantity: { $lte: 0 } } } }
    );

    if (wantsJSON(req)) {
      const populated = await Cart.findOne({ sessionId }).populate('items.productId');
      return res.json(buildCartSummary(populated));
    }

    return res.redirect('/cart');
  } catch (err) {
    console.error(err);
    if (wantsJSON(req)) return res.status(500).json({ error: 'خطا در حذف آیتم' });
    return res.redirect('/cart');
  }
});



app.post('/admin/delete-categore/:id', isAdmin, async (req, res) => {
  try {
      const categoreId = req.params.id;

      await Categore.findByIdAndDelete(categoreId);


      await Iteam.updateMany(
          { categore: categoreId },
          { $set: { categore: null } }
      );

      res.redirect('/admin');
  } catch (err) {
      console.error(err);
      res.status(500).send("خطایی در حذف دسته‌بندی رخ داد");
  }
});



app.post("/order", async (req, res) => {
  try {

    const order = new Order({
      table: req.body.table,
      order: req.body.order,
      status: "pending"
    })

    await order.save()

    const fullOrder = await Order
      .findById(order._id)
      .populate("order.productId")

    const io = req.app.get("io")

    io.emit("newOrder", fullOrder)

    res.redirect("/")

  } catch (err) {
    console.log(err)
    res.status(500).send("order error")
  }
})


/////////////////////////////////////////////////////////////////////////////////////////

app.get('/contact' , (req , res) => {
    res.render('contact.ejs')
})
app.post('/contact' , (req , res) => {
    console.log(req.body);
    const message = new Message(req.body)
    message.save()
        .then(() => {
            console.log('the data saved in DB ...')
            res.redirect('/')
        })
        .catch((e) => console.log(e))
})

app.get('/c0f3l09' , (req , res) => {
  res.render('adminLog')
})

app.post('/c0f3l09', async (req, res) => {
  try {
    const admin = await Pass.findOne();
    if(req.body.username === admin.username && req.body.pass === admin.password){
      req.session.isAdmin = true;
      res.redirect('/admin');
    } else {
      res.send('username or pass wrong');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/c0f3l09');
  }
});



app.get('/admin', isAdmin, async (req, res) => {
  try {
    const [messages, iteams, orders , categore] = await Promise.all([
      Message.find(),
      Iteam.find(),
      Order.find().populate('order.productId'),
      Categore.find()
    ]);

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    res.render('admin', {
      messages,
      iteams,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      categore
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.post('/admin/delete/:id', async (req, res) => {
  try {
    const item = await Iteam.findById(req.params.id);
    if (!item) {
      return res.redirect('/admin');
    }
    if (item.picture) {
      const imagePath = path.join(
        __dirname,
        'public',
        item.picture.replace(/^\/+/, '')
      );      
      fs.unlink(imagePath, err => {
        if (err) console.log(err);
      });
    }
    await Iteam.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.log(err);
    res.redirect('/admin');
  }
});
app.get('/admin/edit/:id' , (req , res) => {
  const id = req.params.id;
  Iteam.findById(id)
    .then(iteam => {
      console.log(iteam)
      res.render('edit' , {iteam})
    })
    .catch(e => console.log(e))
})
app.post('/admin/update/:id', upload.fields([{ name: 'picture', maxCount: 1 }]), async (req, res) => {
  try {
    const { iteamName, price, about, categore } = req.body;
    const item = await Iteam.findById(req.params.id);
    if (!item) return res.redirect('/admin');
    if (req.files && req.files.picture) {
      if (item.picture) {
        const oldImagePath = path.join(__dirname, 'public', item.picture.replace(/^\/+/, ''));
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      item.picture = `/uploads/products/${req.files.picture[0].filename}`;
    }
    item.iteamName = iteamName;
    item.price = price;
    item.about = about;
    item.categore = categore;
    await item.save();
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send("خطا در به‌روزرسانی محصول");
  }
});
app.post('/admin/deleteM/:id', (req, res) => {
  const id = req.params.id;
  Message.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/admin');
    })
    .catch(err => console.log(err));
});
app.post("/admin/order/status/:id", isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).send("order not found")
    }
    if (order.status === "pending") {
      order.status = "preparing"
    }
    else if (order.status === "preparing") {
      order.status = "delivered"
    }
    await order.save()
    const fullOrder = await Order
      .findById(order._id)
      .populate("order.productId")
    const io = req.app.get("io")
    io.emit("orderStatusChanged", fullOrder)
    res.redirect("/admin")
  } catch (err) {
    console.log(err)
    res.status(500).send("status error")
  }
})
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).render("logout", { error: "خطا در خروج از حساب" });
    }
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect("/");
  });
});
app.get("/logout", (req, res) => {
  res.render("logout", { error: null });
});
app.post("/admin/order/delete/:id", isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.redirect("/admin")
  } catch (err) {
    console.log(err)
    res.status(500).send("delete error")
  }
})
app.post("/admin/orders/delete-delivered", isAdmin, async (req, res) => {
  try {

    await Order.deleteMany({ status: "delivered" })

    const io = req.app.get("io")
    io.emit("deliveredOrdersCleared")

    res.redirect("/admin")

  } catch (err) {

    console.log(err)
    res.status(500).send("bulk delete error")

  }
})



app.get('/seting' , (req , res) => {
  res.render('seting')
})
app.get('/setinggetsend' , (req , res) => {
  const sseting = new Seting(req.body)
  sseting.save()
    .then(() => {
      console.log('seting saved ...')
      res.redirect('admin')
    })
    .catch((e) => console.log(e))
})

app.get('/success' , (req , res) => {
  res.render('success')
})
app.use((req, res) => {
  res.status(404).render('e404.ejs');
});
app.use((err, req, res, next) => {

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "خطای داخلی سرور"
  });

});
process.on("uncaughtException", err => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", err => {
  console.error("UNHANDLED REJECTION:", err);
});
