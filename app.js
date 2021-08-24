const express = require('express')
const session = require('express-session');

const app = express()

const { insertProduct, updateProduct, getProductById, deleteProduct
    , getDB, insertUser,getRole } = require('./databaseHandler');

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '156655hjkkjhgggghgg',
    cookie: { maxAge: 600000 }
}));

app.post('/register',async (req,res)=>{
    const name = req.body.txtName;
    const pass = req.body.txtPassword;
    const role = req.body.role;
    insertUser({name:name,pass:pass,role:role})
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
    res.render('login')
})
app.post('/doLogin',async (req,res)=>{
    const name = req.body.txtName;
    const pass = req.body.txtPassword;
    //get role from database: could be "-1", admin, customer
    var role = await getRole(name,pass);
    if(role != "-1"){
        req.session["User"] = {
            name: name,
            role: role
        }
    }
    res.redirect('/');
})

app.get('/edit', async (req, res) => {
    const id = req.query.id;

    const p = await getProductById(id);
    res.render("edit", { product: p });
})
app.post('/update', async (req, res) => {
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    const id = req.body.txtId;

    updateProduct(id, nameInput, priceInput);
    res.redirect("/");
})

app.post('/insert', async (req, res) => {
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    const pictureInput = req.body.txtPicture;
    if(nameInput.length <4){
        res.render("index",{errorMsg:'Ten nho hon 4 ky tu'})
        return;
    }

    const newProduct = { name: nameInput, price: priceInput, picture: pictureInput }

    insertProduct(newProduct);
    res.redirect("/");
})
app.get('/delete', async (req, res) => {
    const id = req.query.id;

    await deleteProduct(id);
    res.redirect("/");
})

app.post('/search', async (req, res) => {
    const searchInput = req.body.txtSearch;
    const dbo = await getDB()
    const allProducts = await dbo.collection("product").find({ name: searchInput }).toArray();

    res.render('index', { data: allProducts })
})

app.get('/', checkLogin, async (req, res) => {
    const dbo = await getDB();
    const allProducts = await dbo.collection("product").find({}).toArray();
    res.render('index', { data: allProducts, auth :req.session["User"] })
})

app.get('/noLogin',checkLogin,(req,res)=>{
    res.render('noLogin')
})

function checkLogin(req,res,next){
    if(req.session["User"] == null){
        res.redirect('/login')
    }else{
        next()
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT)
console.log("app is running ", PORT)