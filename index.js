const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const ejs = require('ejs');
const con = require("./connection");
const bodyParser = require('body-parser');
const { log } = require('console');
const session = require('express-session'); 



app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));




app.get("/", (req, res) => {
    res.render("index.ejs");
})

// app.get("/login", (req, res) => {
//     res.render("loginForm.ejs");
// })

// app.post("/login", (req, res) => {
//     res.send("Logged in");
// })

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
})

app.post("/signup", (req, res) => {
    console.log('Sign Up Form');
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const address = req.body.address;
    let sql = `INSERT INTO user(username,password,email,address) VALUES (?,?,?,?);`;
    let sql2 = `INSERT INTO login(username,password) VALUES (?,?);`

    con.query(sql,[username,password,email,address],(err,result)=>{
        if(err){
            throw err;
        }
        console.log(result.affectedRows);
    })
    con.query(sql2,[username,password],(err,result)=>{
      if(err){
        throw err;
    }
    console.log(result.affectedRows);
    })
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render("loginForm.ejs");
  });
  
  // Route for handling login form submission
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    
  
    // Query the database to check if the user exists
    con.query('SELECT * FROM user WHERE username = ?', [username], (error, results, fields) => {
      if (error) {
        console.error('Error executing MySQL query: ' + error.stack);
        return res.status(500).send('Internal server error.');
      }
  
      // Check if user exists
      if (results.length === 0) {
        return res.status(401).send('User not found. Please sign up.');
      }
  
      // Check if password matches
      if (results[0].password !== password) {
        return res.status(401).send('Invalid username or password.');
      }
  
      if(results[0].username === username && results[0].password === password){
        req.user=results[0].userid;
        console.log("user id" + req.user);
        console.log(req);
        res.redirect('/');
      }
    });
  
  });

  app.delete('/logout',(req, res) => {
    const sql = `DELETE FROM login WHERE `
  });
  

app.get('/product',(req,res)=>{
    // res.render('product.ejs');
    let q = `SELECT * FROM product`;

    con.query(q,(err,result,fields)=>{
        if(err){
            throw err;
        }
        
        console.log(result);
        res.render('productz.ejs', { result });

    })
})
app.get('/product/:pid',(req,res)=>{
 let {pid}=req.params; 
 let q = `SELECT * FROM product WHERE pid=?`;
 
 con.query(q,[pid],(err,result,fields)=>{
  if(err){
    throw err;
}
console.log(result)
res.render('productInfo.ejs', {result});
 })
  
})

// app.get('/cart', (req, res) => {
//   res.render('cart.ejs');
// });

// app.get('/cart/:pid',(req,res)=>{
//   const {pid}=req.params;
//   console.log(pid);

//   // const {userid} = req.user;
//   // console.log("req.user in cart" + userid);

//   let q = `SELECT * FROM product WHERE userid=?;`;
//   con.query(q,[userid],(err,result,fields)=>{
//     if(err){
//       throw err;
//   }

//   res.render('cart.ejs', {result});
//    })
    
// })
app.get('/nike', (req, res) => {
  res.render('homeNike.ejs');
});
app.get('/Adidas', (req, res) => {
  res.render('homeAdidas.ejs');
});
app.get('/Puma', (req, res) => {
  res.render('homePuma.ejs');
});
app.get('/Mizuno', (req, res) => {
  res.render('homeMizuno.ejs');
});
app.get('/aboutus', (req, res) => {
  res.render('about.ejs');
});
app.get('/contactus', (req, res) => {
  res.render('contactus.ejs');
});

app.get('/payment', (req, res) => {
  res.render('payment.ejs');
});



app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if user is logged in
// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  console.log("Checking user authentication...");
  console.log("Path:", req.path);
  console.log("Session:", req.session);

  // Exclude '/cart' route from redirection if user is already logged in
  if (req.path === '/cart' && req.session.userid) {
    console.log("User is logged in, proceeding to cart...");
    return next();
  }

  // Redirect to login page if user is not logged in
  if (!req.session.userid) {
    console.log("User is not logged in, redirecting to login page...");
    return res.redirect('/login');
  } else {
    console.log("User is logged in, proceeding...");
    next();
  }
};



app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Authenticate user against your user table in the database
  con.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) throw err;
    if (results.length) {
      req.session.userid = results[0].id; // Store user ID in session
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
});



// Assuming the product table has columns: id, name, price
// And the users table has columns: id, username, password

// ...

// Route to add an item to the cart
app.post('/addtocart', requireLogin, (req, res) => {
  const userid = req.session.userid;
  const pid = req.body.pid;
  const quantity = req.body.quantity && 1; // Default to 1 if quantity is not provided

  // Check if the item is already in the cart
  con.query('SELECT * FROM cart WHERE userid = ? AND pid = ?', [userid, pid], (err, results) => {
    if (err) throw err;
    if (results.length) {
      // If item is already in the cart, update the quantity
      con.query('UPDATE cart SET quantity = quantity + ? WHERE userid = ? AND pid = ?', [quantity, userid, pid], (err, updateResult) => {
        if (err) throw err;
        res.redirect('/cart');
      });
    } else {
      // If item is not in the cart, insert it
      con.query('INSERT INTO cart (userid, pid, quantity) VALUES (?, ?, ?)', [userid, pid, quantity], (err, insertResult) => {
        if (err) throw err;
        res.redirect('/cart');
      });
    }
  });
});

// Route to view the cart
app.get('/cart', requireLogin, (req, res) => {
  const userid = req.session.userid;

  // Join the cart table with the product table to get product details
  con.query('SELECT cart.quantity, product.pname, product.price FROM cart INNER JOIN product ON cart.pid = product.pid WHERE cart.userid = ?', [userid], (err, results) => {
    if (err) throw err;
    res.render('cart', { items: results });
  });
});

// //Route to view the cart with parameter
// app.get('/cart/:id', requireLogin, (req, res) => {
//   const userid = req.session.userid;
//   const cartId = req.params.id; // Access the parameter id from the URL

//   // Assuming you have a function to fetch cart details based on cartId
//   fetchCartDetails(cartId, (err, cart) => {
//     if (err) throw err;

//     res.render('cart', { cart }); // Render cart view with cart details
//   });
// });

// Route to remove an item from the cart
app.post('/removefromcart', requireLogin, (req, res) => {
  const userid = req.session.userid;
  const pid = req.body.pid;

  con.query('DELETE FROM cart WHERE userid = ? AND pid = ?', [userid, pid], (err, results) => {
    if (err) throw err;
    res.redirect('/cart');
  });
});


// ADMIN/////////////////

// Route to display the admin login page
app.get('/admin/login', (req, res) => {
  res.render('adminlogin.ejs');
});

// Route to handle admin login form submission
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the provided credentials match the admin credentials in the database
  con.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
          // If credentials are correct, set session variable to indicate admin is logged in
          req.session.isAdminLoggedIn = true;
          res.redirect('/admin/dashboard');
      } else {
          res.redirect('/admin/login');
      }
  });
});

// Middleware to check if admin is logged in
const requireAdminLogin = (req, res, next) => {
  if (!req.session.isAdminLoggedIn) {
      res.redirect('/admin/login');
  } else {
      next();
  }
};


// Route to display admin dashboard
// Assuming you have a route to fetch all products from the database
app.get('/admin/dashboard', requireAdminLogin, (req, res) => {
  // Assuming you have a function to fetch all products from the database
  con.query('SELECT * FROM product', (err, results) => {
      if (err) {
          console.error('Error fetching products:', err);
          res.status(500).send('Internal Server Error');
      } else {
          // Render the admin dashboard template and pass the products to it
          res.render('admin.ejs', { products: results });
      }
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());

app.get('/admin/dashboard/addproducts', (req, res) => {
  res.render('adminaddproduct.ejs');
});

app.post('/admin/addproducts', (req, res) => {
  const { pname, brand, price, ogprice, pimage1, pimage2, pimage3, pcolor, prating } = req.body;
 console.log(req.body);
  // Insert into MySQL table
  con.query(`INSERT INTO product (pname, brand, price, ogprice, pimage1, pimage2, pimage3, pcolor, prating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                   [pname, brand, price, ogprice, pimage1, pimage2, pimage3, pcolor, prating], 
                   (error, results) => {
    if (error) {
      console.error('Error inserting data into MySQL:', error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('New product inserted successfully!');
      res.redirect('/admin/addproducts'); // Redirect back to the add product form
    }
  });
});



// Route to handle admin logout
app.post('/admin/logout', (req, res) => {
  // Clear the session data indicating admin is logged in
  req.session.isAdminLoggedIn = false;
  // Redirect to admin login page
  res.redirect('/admin/login');
});

app.get('/admin/dashboard/deleteproducts', (req, res) => {
  res.render('admindeleteproduct.ejs');
});

// Route to handle deleting a product by PID
app.post('/admin/deleteproductbyid', (req, res) => {
  const pid = req.body.pid;

  // Delete the row from the product table based on PID
  con.query('DELETE FROM product WHERE pid = ?', [pid], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/admin/dashboard'); // Redirect back to the admin dashboard
  });
});

// Route to handle deleting a product by PName
app.post('/admin/deleteproductbyname', (req, res) => {
  const pname = req.body.pname;

  // Delete the row from the product table based on PName
  con.query('DELETE FROM product WHERE pname = ?', [pname], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/admin/dashboard'); // Redirect back to the admin dashboard
  });
});


app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
})