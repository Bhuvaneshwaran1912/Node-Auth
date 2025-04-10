const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')
require('dotenv').config()

// var auth = require('../services/authentication');
// var checkRole = require('../services/checkRole');
// const e = require('express');

router.get('/getUser', authenticateToken, (req, res) => {
    var query = "select * from usermanagement";
    connection.query(query, (err, results) => {
        if (!err) {
            var obj = {
                data: results,
            }
            if (results.length > 0) {
                obj.code = 200; obj.message = 'Success';
                return res.status(200).json(obj)
            }
            else if (results.length == 0) {
                obj.code = 300; obj.message = 'No records Found!!'; obj.data = []
                return res.status(200).json(obj)
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.post('/signUp', (req, res) => {
    var obj = {}
    let user = req.body;
    query = `select * from usermanagement where USR_EMAIL = '${user.USR_EMAIL}'`;
    connection.query(query, (err, results) => {
        obj.data = results;
        if (!err) {
            if (results.length <= 0) {
                query = "insert into usermanagement(USR_NAME, USR_EMAIL, USR_PSWD, USR_PHNO, USR_GENDER) values(?,?,?,?,?)";
                connection.query(query, [user.USR_NAME, user.USR_EMAIL, user.USR_PSWD, user.USR_PHNO,
                user.USR_GENDER], (err, results) => {
                    if (!err) {
                        obj.code = 200; obj.message = 'Registered Successfully !';
                        return res.status(200).json(obj)
                    } else {
                        obj.code = 500; obj.message = 'Something Went Wrong !';
                        return res.status(500).json(err)
                    }
                })
            } else {
                obj.code = 300; obj.message = 'User Email Already Exixts !'; delete obj.data
                return res.status(200).json(obj);
            }
        }
        else {
            return res.status(500).json(err)
        }
    })
})

router.post('/signIn', (req, res) => {
    var obj = {}
    const user = req.body;
    query = `select * from usermanagement where USR_EMAIL = '${user.USR_EMAIL}'`;
    connection.query(query, (err, results) => {

        if (!err) {
            if (results.length == 0) {
                obj.code = 300; obj.message = 'No User Found !!';
                return res.status(200).json(obj)
            }
            else if (results[0].USR_EMAIL == user.USR_EMAIL) {
                if (results[0].USR_PSWD != user.USR_PSWD) {
                    obj.code = 300; obj.message = 'Please Check Password !!';
                    return res.status(200).json(obj);
                }
                else if (results[0].USR_PSWD == user.USR_PSWD) {
                    require('crypto').randomBytes(48, function (err, buffer) {
                        const userPayload = results[0]; // Example payload
                        const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                        // var token = buffer.toString('hex');
                        obj.code = 200; obj.message = 'Logged In Successfully !!'; obj.token = token;
                        obj.data = results
                        res.status(200).json(obj)
                    });
                }
            }
            else {
                return res.status(400).json({ message: "Something went wrong , Kindly try again later" })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.post('/userUpdate', (req, res) => {
    var user = req.body;
    var obj = {}
    var query = "update usermanagement set USR_NAME=?, USR_EMAIL=?, USR_PHNO=?, USR_GENDER=? where id=?";
    connection.query(query, [user.USR_NAME, user.USR_EMAIL, user.USR_PHNO,
    user.USR_GENDER, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                obj.code = 300; obj.message = 'User ID does not exists !';
                return res.status(200).json(obj);
            } else {
                var query = "select * from usermanagement";
                connection.query(query, (err, getResult) => {
                    if (getResult.length > 0) {
                        obj.code = 200; obj.message = 'User Updated Successfully !'; obj.data = getResult;
                        return res.status(200).json(obj);
                    }
                })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

router.post('/userDelete', (req, res) => {
    var user = req.body;
    var obj = {}
    var query = "delete from usermanagement where id=?";
    connection.query(query, [user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                obj.code = 300; obj.message = 'User ID does not exists !';
                return res.status(200).json(obj);
            } else {
                var query = "select * from usermanagement";
                connection.query(query, (err, getResult) => {
                    if (getResult.length > 0) {
                        obj.code = 200; obj.message = 'User Deleted Successfully !'; obj.data = getResult;
                        return res.status(200).json(obj);
                    }
                })
            }
        } else {
            return req.status(500).json(err)
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post("/forgotPassword", (req, res) => {
    const user = req.body;
    var obj = {}
    query = "select USR_EMAIL,USR_PSWD from usermanagement where USR_EMAIL=?";
    connection.query(query, [user.USR_EMAIL], (err, results) => {
        console.log("err", err);
        if (!err) {
            console.log("results", results);
            if (results.length <= 0) {
                obj.code = 300; obj.message = 'No User Found !!';
                return res.status(200).json(obj)
            }
            else {
                var resetLink = 'http://localhost:4200/signUp'
                var mailoption = {
                    from: process.env.EMAIL,
                    to: results[0].USR_EMAIL,
                    subject: 'Password Reset Request',
                    html: `
                        <p>Hello,</p>
                        <p>You requested to reset your password.Your passoword is "${results[0].USR_PSWD}". Please click the link below to reset your password:</p>
                        <a href="${resetLink}" target="_blank">Reset Password</a>
                        <p>If you did not request this, please ignore this email.</p>
                    `,
                };
                transporter.sendMail(mailoption, (err, info) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log("Email sent :" + info.response)
                        obj.code = 200; obj.message = 'Password sent sucessfully to your registered email !!';
                        return res.status(200).json(obj)
                    }
                })
            }
        } else {
            return res.status(500).json(err)
        }
    })
})

// router.post('/updateUserStatus', auth.authenticateToken, checkRole.checkRole, (req, res) => {
//     var user = req.body;
//     var query = "update user set status=? where id=?";
//     connection.query(query, [user.status, user.id], (err, results) => {
//         if (!err) {
//             if (results.affectedRows == 0) {
//                 return res.status(404).json({ message: "User ID does not exists." })
//             } else {
//                 return res.status(200).json({ message: "User Updated Successfully" })
//             }
//         } else {
//             return req.status(500).json(err)
//         }
//     })
// })


// router.get('/checkToken', auth.authenticateToken, (req, res) => {
//     return res.status(200).json({ message: "true" })
// })


// router.post('/changePassword', auth.authenticateToken, (req, res) => {
//     const user = req.body;
//     const email = res.locals.email;
//     console.log("email",email)
//     var query = "select * from user where email=? and password=?";
//     connection.query(query, [email, user.oldPassword], (err, results) => {
//         console.log("Results",results)
//         if (!err) {
//             if (results.length <= 0) {
//                 return res.status(400).json({ message: "Incorrect Old password" })
//             }
//             else if (results[0].password == user.oldPassword) {
//                 query = "update user set password=? where email=?";
//                 connection.query(query, [user.newPassword, email], (err, results) => {
//                     if (!err) {
//                         return res.status(200).json({ message: "Password Updated Successfully" })
//                     } else {
//                         return res.status(500).json(err);
//                     }
//                 })
//             }
//             else {
//                 return res.status(400).json({ message: "Something went wrong, Please try again later" })
//             }
//         }
//         else {
//             return res.status(500).json(err);
//         }
//     })
// })

module.exports = router;