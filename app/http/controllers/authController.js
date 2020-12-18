const User=require('../../models/user');
const bcrypt=require('bcrypt');
const passport = require('passport');
function authController() {
    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {
            const { email, password } = req.body;
            /// Validate Request
            if (!email || !password) {
                req.flash('error', 'All Fields Are Required');
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    else{
                        return res.redirect(_getRedirectUrl(req))
                    }

                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res) {
            const {name,email,password}=req.body;
            // Validate Request
            if(!name || !email || !password){
                req.flash('error','All Fields Are Required')
                req.flash('name',name)
                req.flash('email', email)
                return res.redirect('/register')
            }
            //// Check If Email Exist
            User.findOne({email:email},(err,result)=>{
                if(result){
                    req.flash('error', 'Email Already Exist')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })

            /// Hash A Password
            const hashPassword=await bcrypt.hash('password',10)

            /// Create A User
            const user = new User({ name: name, email: email, password: hashPassword});
            user.save().then((data)=>{
                /// Login
                return res.redirect('/')
            }).catch((err)=>{
                req.flash('error', 'Something Went Wrong')
                return res.redirect('/register')
            })
        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

module.exports = authController