/**
 * Authentication Controller to handle authentication
 */
 // Creating the User Module

    const express = require("express")
    const app = express.Route()

 // Create the Mongoose schema in /users/models/users.model.js:
 
         const userSchema = new Schema({
         firstName: String,
         lastName: String,
         email: String,
         password: String,
         permissionLevel: Number
         });
         
         
 // Attach the schema to the user model.
 
         const userModel = mongoose.model('Users', userSchema);
         
 // create user” operation by defining the route
 
         app.post('/users', [
         UsersController.insert
         ]);
         
 //This is pulled into our Express app in the main index.js file
 // The UsersController object is imported from our controller, where 
 // we hash the password appropriately, defined in 
 //users/controllers/users.controller.js:
 
         exports.insert = (req, res) => {
         let salt = crypto.randomBytes(16).toString('base64');
         let hash = crypto.createHmac('sha512',salt)
                                     .update(req.body.password)
                                     .digest("base64");
         req.body.password = salt + "$" + hash;
         req.body.permissionLevel = 1;
         UserModel.createUser(req.body)
        .then((result) => {
            res.status(201).send({id: result._id});
         });
         };
 
 // At this point, we can test our Mongoose model by running the 
 // server (npm start) and sending a POST request to /users with some JSON data:
 
 //        {
//      "firstName" : "ABC",
 //        "lastName" : "DEF",
 //        "email" : "ABCE@goodal.com",
  //       "password" : "s3cr3tp4sswo4rd"
//         }
         
 // There are several tools you can use for this. Insomnia (covered below) 
 // and Postman are popular GUI tools, and curl is a common CLI choice. 
 // You can even just use JavaScript, e.g., from your browser’s built-in 
 // development tools console:
 
         fetch('http://localhost:3600/users', {
         method: 'POST',
         headers: {
             "Content-type": "application/json"
         },
         body: JSON.stringify({
             "firstName": "Marcos",
             "lastName": "Silva",
             "email": "marcos.henrique@toptal.com",
             "password": "s3cr3tp4sswo4rd"
         })
     })
     .then(function(response) {
         return response.json();
     })
     .then(function(data) {
         console.log('Request succeeded with JSON response', data);
     })
     .catch(function(error) {
         console.log('Request failed', error);
     });
     
 //At this point, the result of a valid post will be just the id 
 // from the created user: 
 //        { "id": "5b02c5c84817bf28049e58a3" }.
         
 // We need to also add the createUser method to the model in 
 // users/models/users.model.js:
 
         exports.createUser = (userData) => {
         const user = new User(userData);
         return user.save();
         };
         
 // We need to see if the user exists.we are going to implement the “get user by id” 
 // feature for the following endpoint: users/:userId.
 
         app.get('/users/:userId', [
         UsersController.getById
         ]);
 
 // Then, we create the controller in /users/controllers/users.controller.js:
 
         exports.getById = (req, res) => {
         UserModel.findById(req.params.userId).then((result) => {
        res.status(200).send(result);
         });
         };
 
 // Finally, add the findById method to the model in /users/models/users.model.js:
 
         exports.findById = (id) => {
         return User.findById(id).then((result) => {
         result = result.toJSON();
         delete result._id;
         delete result.__v;
         return result;
         });
     };
     
     
 // The response will be like this:
 //       { 
 //            "firstName": "Marcos",
  //           "lastName": "Silva",
//             "email": "marcos.henrique@toptal.com",
 //            "password": "Y+XZEaR7J8xAQCc37nf1rw==$p8b5ykUx6xpC6k8MryDaRmXDxncLumU9m",
 //            "permissionLevel": 1,"id": "5b02c5c84817bf28049e58a3"
//
//           }
 
 
// NB: Note that we can see the hashed password. We are showing the password, 
//but the obvious best practice is never to reveal the password, even if it has 
//been hashed. Another thing we can see is the permissionLevel, which we will use 
// to handle the user permissions later on.////
 
// We skip that for now and get back to it once we implement the auth module. 
 
         exports.patchById = (req, res) => {
         if (req.body.password){
             let salt = crypto.randomBytes(16).toString('base64');
             let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
             req.body.password = salt + "$" + hash;
         }
         UserModel.patchUser(req.params.userId, req.body).then((result) => {
                 res.status(204).send({});
         });
         };
         
 // By default, we will send an HTTP code 204 with no response body to indicate that 
 // the request was successful.
 
 
 //We need to add the patchUser method to the model:
 
         exports.patchUser = (id, userData) => {
         return User.findOneAndUpdate({
         _id: id
         }, userData);
         };
         
 //The user list will be implemented as a GET at /users/ by the following controller:
 
         exports.list = (req, res) => {
         let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
         let page = 0;
         if (req.query) {
         if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
         }
     }
         UserModel.list(limit, page).then((result) => {
             res.status(200).send(result);
         })
         };
         
 // Corresponding model method
 
         exports.list = (perPage, page) => {
     return new Promise((resolve, reject) => {
         User.find()
             .limit(perPage)
             .skip(perPage * page)
             .exec(function (err, users) {
                 if (err) {
                     reject(err);
                 } else {
                     resolve(users);
                 }
             })
         });
     };
     
     
 // The resulting list response will have the following structure:
 
//    [
  //     {
 //       "firstName": "Marco",
 //       "lastName": "Silva",
 //      "email": "marcos.henrique@toptal.com",
 //      "password": "z4tS/DtiH+0Gb4J6QN1K3w==$al6sGxKBKqxRQkDmhnhQpEB6+DQgDRH2qr47BZcqLm4/fphZ7+a9U+HhxsNaSnGB2l05Oem/BLIOkbtOuw1tXA==",
  //     "permissionLevel": 1,
 //       "id": "5b02c5c84817bf28049e58a3"
  //  },
 //  {
//     "firstName": "Paulo",
 //   "lastName": "Silva",
//   "email": "marcos.henrique2@toptal.com",
 //    "password": "wTsqO1kHuVisfDIcgl5YmQ==$cw7RntNrNBNw3MO2qLbx959xDvvrDu4xjpYfYgYMxRVDcxUUEgulTlNSBJjiDtJ1C85YimkMlYruU59rx2zbCw==",
 //     "permissionLevel": 1,
 //     "id": "5b02d038b653603d1ca69729"
// 	}
// 	]
 
 
 // DELETE at /users/:userId.
 
         exports.removeById = (req, res) => {
         UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
         });
     };
     
     
 // The controller will return HTTP code 204 and no content body as confirmation.
 
 			exports.removeById = (userId) => {
             return new Promise((resolve, reject) => {
             User.deleteMany({_id: userId}, (err) => {
             if (err) {
                 reject(err);
             } else {
                 resolve(err);
             }
             });
         });
     };
     
     
 // Creating the Auth Module
 
 // create an endpoint for POST requests to /auth resource. The request 
 // body will contain the user email and password:
 
 //        {
 //        "email" : "avcd.xyz@goodal.com",
 //        "password" : "s3cr3tp4sswo4rd2"
 //        }
 
 //  Validate the user in /authorization/middlewares/verify.user.middleware.js:
 
     exports.isPasswordAndUserMatch = (req, res, next) => {
     UserModel.findByEmail(req.body.email)
         .then((user)=>{
             if(!user[0]){
                 res.status(404).send({});
             }else{
                 let passwordFields = user[0].password.split('$');
                 let salt = passwordFields[0];
                 let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                 if (hash === passwordFields[1]) {
                     req.body = {
                         userId: user[0]._id,
                         email: user[0].email,
                         permissionLevel: user[0].permissionLevel,
                         provider: 'email',
                         name: user[0].firstName + ' ' + user[0].lastName,
                     };
                     return next();
                 } else {
                     return res.status(400).send({errors: ['Invalid email or password']});
                     }
                 }
             });
         };
 
 // Move to the controller and generate the JWT:
 
         exports.login = (req, res) => {
    try {
        let refreshId = req.body.userId + jwtSecret;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        req.body.refreshKey = salt;
        let token = jwt.sign(req.body, jwtSecret);
        let b = Buffer.from(hash);
        let refresh_token = b.toString('base64');
        res.status(201).send({accessToken: token, refreshToken: refresh_token});
         } catch (err) {
         res.status(500).send({errors: err});
         }
     };
     
 //#	NB:The controller has been set up to enable such generation to make it easier 
 //#	to implement it in subsequent development.
 
 // Create the route and invoke the appropriate middleware in 
 // /authorization/routes.config.js
 
         app.post('/auth', [
                 VerifyUserMiddleware.hasAuthValidFields,
                 VerifyUserMiddleware.isPasswordAndUserMatch,
                 AuthorizationController.login
             ]);
             
 //# The response will contain the generated JWT in the accessToken field:
 
 //#  {
 //#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1Yj
 //#		AyYzVjODQ4MTdiZjI4MDQ5ZTU4YTMiLCJlbWFpbCI6Im1hcmNvcy5oZW5yaXF1ZUB0b3B0
 //#		YWwuY29tIiwicGVybWlzc2lvbkxldmVsIjoxLCJwcm92aWRlciI6ImVtYWlsIiwibmFtZSI
 //#		6Ik1hcmNvIFNpbHZhIiwicmVmcmVzaF9rZXkiOiJiclhZUHFsbUlBcE1PakZIRG1FeENRPT
 //#		0iLCJpYXQiOjE1MjY5MjMzMDl9.mmNg-i44VQlUEWP3YIAYXVO-74803v1mu-y9QPUQ5VY",
 //#  "refreshToken": "U3BDQXBWS3kyaHNDaGJNanlJTlFkSXhLMmFHMzA2NzRsUy9Sd2J0YVNDTm
 //#		Uva0pIQ0NwbTJqOU5YZHgxeE12NXVlOUhnMzBWMGNyWmdOTUhSaTdyOGc9PQ=="
 //# 	}
 
 // Having created the token, we can use it inside the Authorization header using the 
 // form Bearer ACCESS_TOKEN
 
 
 // Creating Permissions and Validations Middleware
 
 // Define is who can use the users resource:
  //   -Public for creating users (registration process)
 //    -Private for the logged-in user and for admins to update that user.
 //    -Private for admin only for removing user accounts.
     
 // we will first require a middleware that always validates the user if they are 
 // using a valid JWT.
 // The middleware in /common/middlewares/auth.validation.middleware.js
 
             exports.validJWTNeeded = (req, res, next) => {
                 if (req.headers['authorization']) {
                 try {
                 let authorization = req.headers['authorization'].split(' ');
                 if (authorization[0] !== 'Bearer') {
                     return res.status(401).send();
                 } else {
                     req.jwt = jwt.verify(authorization[1], secret);
                     return next();
                 }
             } catch (err) {
                 return res.status(403).send();
             }
         } else {
             return res.status(401).send();
         }
     }; 
     
 // We will use HTTP error codes for handling request errors:
//  -HTTP 401 for an invalid request
 //  -HTTP 403 for a valid request with an invalid token, or 
//  valid token with invalid permissions
     
 // We can use the bitwise AND operator (bitmasking) to control the permissions. 
 // If we set each required permission as a power of 2, we can treat each bit of 
 // the 32-bit integer as a single permission
 
         exports.minimumPermissionLevelRequired = (required_permission_level) => {
    return (req, res, next) => {
        let user_permission_level = parseInt(req.jwt.permission_level);
        let user_id = req.jwt.user_id;
        if (user_permission_level & required_permission_level) {
            return next();
        } else {
            return res.status(403).send();
             }
         };
     };
     
 //# The middleware is generic. If the user permission level and the required 
 //# permission level coincide in at least one bit, the result will be greater 
 //# than zero, and we can let the action proceed; otherwise, the HTTP code 403 
 //# will be returned.
 
 
 // add the authentication middleware to the user’s module routes in 
 // /users/routes.config.js
 
         app.post('/users', [
         UsersController.insert
         ]);
         app.get('/users', [
         ValidationMiddleware.validJWTNeeded,
         PermissionMiddleware.minimumPermissionLevelRequired(PAID),
         UsersController.list
         ]);
         app.get('/users/:userId', [
         ValidationMiddleware.validJWTNeeded,
         PermissionMiddleware.minimumPermissionLevelRequired(FREE),
         PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
         UsersController.getById
         ]);
             app.patch('/users/:userId', [
         ValidationMiddleware.validJWTNeeded,
         PermissionMiddleware.minimumPermissionLevelRequired(FREE),
         PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
         UsersController.patchById
         ]);
         app.delete('/users/:userId', [
         ValidationMiddleware.validJWTNeeded,
         PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
         UsersController.removeById
         ]);
     
 //// This concludes the basic development of our REST API////
 
 //// Running and Testing ////
 
    module.exports = app
 
 
 