var express = require('express');
var jwt = require('jsonwebtoken');
var path = require('path');
var app = express();
var mongoose   = require('mongoose');
mongoose.connect('mongodb+srv://ibrahimhossain495:Jewel.@taskmanager.j1bgldq.mongodb.net/Node_API?retryWrites=true&w=majority').then(()=> console.log("DB connection success")).catch(() => console.log("failed"));
mongoose.Promise = global.Promise;

var Login = require('./app/models/Login');
var Notes = require('./app/models/Note');
var config = require('./config');
var bodyParser = require('body-parser');
var empty  = require('is-empty');

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

app.set('superSecret',config.secret);

var port = process.env.PORT || 3003;

var router = express.Router();

app.use(express.static(path.join(__dirname, 'dist')))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.route('/register').post(async(req, res) => {
	console.log("request............", req.body.email);
    try {
		let user = await Login.find({email: req.body.email});
		console.log("data....", user);
		
		// if(user[0].email != undefined && user == exist[0].email){
		// 	return res.json({
		// 		status: 409,
		// 		message : 'Already registered.'
		// 	});
		// }else{
			const user_data = await Login.create(req.body);
			return res.status(200).json(user_data);
		
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
});

	router.route('/login')
	.post(async (req, res)=>{
		try{
			var userEmail = await Login.find({email: req.body.email});
			var userPassword = await Login.find({password: req.body.password});
			// console.log("login User email db: ", userEmail[0].email, "login User email client: ", req.body.email, "user password", userPassword[0].password, "login User password client", req.body.password);
			let dbEmail = userEmail[0].email;
			let clientEmail = req.body.email;
			let dbPassword = userPassword[0].password;
			let clientPassword = req.body.password;

			if( dbEmail != undefined && dbEmail === clientEmail  
				&& dbPassword != undefined && dbPassword === clientPassword
				){
					console.log("welcome to this application");
					const payload = {
							clientEmail: dbEmail
						};
						var token = jwt.sign(payload, app.get('superSecret'), {
							expiresIn : 60*60*24 // expires in 24 hours
						});
						res.status(200).json({
							message : "You have succesfully loggedin.",
							token	: token
						});
			}else{
				console.log("You are Invalid user");
				return res.status(500).json({message: "Invalid user"});
			}
		}catch(error){
			console.log("Unauthorized!", error.message);
			return res.status(500).json({message: error.message});
		}
	})
		
	router.route('/note/add')
	.post(async(req, res)=>{
		try{
			const responseRequest = await Notes.create(req.body);
			return res.status(200).json({msg: responseRequest})
		}catch(error){
			return res.status(500).end();
		}
 	});


router.use(function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token){
    jwt.verify(token, app.get('superSecret'), function(err,decoded){
      if(err){
		return res.json({status : 403,success:false, message:'Failed to authenticate token.'});
      } else {
		req.decoded = decoded;
		next();
      }
    });
  } else {
    return res.json({
      status : 403,	
      success: false,
      message: 'No token provided.'
    });
  }
});

router.route('/result')
	.get(function(req, res) {
        Login.find(function(err, logins) {
            if (err)
                res.send(err);
            res.json(logins);
        });
 	});

app.use('/api',router);
app.get('/*', function(req, res){
  res.sendFile('/dist/index.html' ,{root:__dirname});
});
app.listen(port);
