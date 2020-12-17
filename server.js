require('dotenv').config();
const express=require('express');
const app=express();
const ejs=require('ejs');
const path=require('path');
const expressLayout=require('express-ejs-layouts');
const session=require('express-session');
const flash= require('express-flash');
const MongoDbStore = require('connect-mongo')(session)
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/pizza_gateway', { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true,useFindAndModify:true })
.then((data)=>{
    console.log("Database Connected....")
}).catch(err=>{
    console.log("Datbase Failed To Connect....",err)
})
const connection=mongoose.connection;
const port=process.env.PORT || 3000;


///Session Store
let mongoStore=new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})



//// Session Configuration
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave:false,
    store: mongoStore,
    saveUninitialized: false,
    cookie:{maxAge: 1000*60*60*24} /// 24 hours
}))

app.use(flash())



/// Assets
app.use(express.static('public'))
app.use(express.json())


/// Global MiddleWare
app.use((req,res,next)=>{
    res.locals.session=req.session
    next();
})

/// Set Template Engine
app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine','ejs')


require('./routes/web')(app)



app.listen(port,()=>{
    console.log(`Server Is Running On Port ${port}.....!`)
})