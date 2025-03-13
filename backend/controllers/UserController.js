const User = require('../models/User');
const sendToken = require('../utils/jwtToken');
const File = require('../utils/cloudinary');

// exports.register = async (req, res, next) => {

//     try {

//         const file = req.file;

//         if (!file) return res.status(400).send('No image in the request');

//         req.body.avatar = await File.uploadSingle({ filePath: file.path });

//         console.log(req.body);

//         const user = await User.create(req.body)

//         if (!user) {
//             return res.status(400).send('the user cannot be created!')
//         }

//         return sendToken(user, 200, res, 'Success');

//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({
//             message: 'Please try again later',
//             success: false,
//         })
//     }
// }


exports.register = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).send('No image in the request');
        req.body.avatar = await File.uploadSingle({ filePath: file.path });
        const user = await User.create(req.body);
        if (!user) {
            return res.status(400).send('The user cannot be created!');
        }
        return res.status(200).json({
            message: 'Thank you for signing up, wait for the admin to review your credentials',
            success: true,
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        });
    }
};


// exports.login = async (req, res, next) => {

//     try {

//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Please enter email & password' })
//         }

//         let user = await User.findOne({ email }).select('+password');


//         if (!user) {
//             return res.status(400).json({ message: 'Invalid Email or Password' });
//         }

//         const passwordMatched = await user.comparePassword(password);

//         if (!passwordMatched) {
//             return res.status(401).json({ message: 'Invalid Email or Password' })
//         }

//         user = await User.findOne(user._id);
//         await user.setActive();

//         sendToken(user, 200, res, 'Successfully Login')

//     } catch (err) {
//         return res.status(400).json({
//             message: 'Please try again later',
//             success: false,
//         })
//     }

// }


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email & password' });
        }
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }
        const passwordMatched = await user.comparePassword(password);
        if (!passwordMatched) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }
        if (!user.isApproved) {
            return res.status(403).json({ message: 'Looks like you are not approved by the admin yet' });
        }
        user = await User.findOne(user._id);
        await user.setActive();
        sendToken(user, 200, res, 'Successfully Login');
    } catch (err) {
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        });
    }
};




exports.approveUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        if (req.body.isApproved) {
            user.isApproved = true;
            await user.save();
            return res.json({
                message: 'User approved successfully',
                success: true,
            });
        } else {
            await user.deleteOne();
            return res.json({
                message: 'User declined and deleted successfully',
                success: true,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Please try again later',
            success: false,
        });
    }
};





exports.getSingleUser = async (req, res, next) => {

    try {

        const user = await User.findById(req.params.id);

        res.json({
            user,
            success: true,
        })

    } catch (err) {
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        })
    }

}

exports.updateUser = async (req, res, next) => {

    try {

        const file = req.file;

        if (file) {
            req.body.avatar = await File.uploadSingle({ filePath: file.path });
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

        console.log(user);

        sendToken(user, 200, res, 'successfully updated!')

    } catch (err) {
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        })
    }

}

exports.sendCode = async (req, res, next) => {

    try {

        let user = null;

        if (req.params.id === 'email') {
            user = await User.findOne({ email: req.query.email });
        } else {
            user = await User.findById(req.params.id);
        }

        if (!user) {
            return res.status(404).json({
                message: "Email doesn't exist.",
                success: true,
            })
        }

        await user.getResetPasswordCode();
        await user.save();
        await user.sendResetPasswordCode();

        return res.json({
            message: "Code sent to your email",
            success: true,
        })

    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        })
    }

}

exports.verifyCode = async (req, res, next) => {


    try {

        let user = null;

        if (req.params.id === 'email') {
            user = await User.findOne({ email: req.body.email });
        } else {
            user = await User.findById(req.params.id);
        }

        const status = await user.verifyCode(req.body.code);

        if (status === 'expired') {

            return res.status(400).json({
                message: "code expired",
                success: true,
            })

        }

        if (status === 'wrong') {

            return res.status(400).json({
                message: "code does not matched",
                success: true,
            })

        }

        return res.json({
            message: "You can now change your password",
            success: true,
            user,
        })

    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        })
    }
}


exports.listAll = async (req, res, next) => {
    try {

        console.log("Asdsad")

        const users = await User.find({});

        return res.json({
            message: "All users",
            success: true,
            users: users,
        })

    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        })
    }
}


// exports.deleteUser = async (req, res, next) => {
//     try {

//         console.log(req.params.id)

//         await User.findByIdAndDelete(req.params.id);

//         return res.json({
//             message: "User Deleted",
//             success: true,
//         })

//     } catch (err) {
//         return res.status(400).json({
//             message: 'Please try again later',
//             success: false,
//         })
//     }
// }


// exports.updateRole = async (req, res, next) => {
//     try {

//         const user = await User.findById(req.params.id);

//         user.role = req.body.role;

//         user.save();

//         return res.json({
//             message: "User Deleted",
//             success: true,
//             user: user,
//         })

//     } catch (err) {
//         return res.status(400).json({
//             message: 'Please try again later',
//             success: false,
//         })
//     }
// }

exports.updateRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        user.role = req.body.role;

        await user.save(); // Await the save operation

        return res.json({
            message: "User role updated",
            success: true,
            user: user,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Please try again later',
            success: false,
        });
    }
}



exports.getActiveUsers = async (req, res) => {
    try {
        const activeUsers = await User.find({ isActive: true }).select('username email');
        res.status(200).json({ success: true, users: activeUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch active users.' });
    }
};

exports.getNumberOfUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        return res.json({
            success: true,
            count: userCount,
        });
    } catch (err) {
        return res.status(400).json({
            message: 'Please try again later',
            success: false,
        });
    }
};


exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        await user.deleteOne(); // Deletes the user from the database

        return res.json({
            message: "User deleted successfully",
            success: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Please try again later',
            success: false,
        });
    }
};








exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
       const user1 = await user.save();
       console.log(user1)

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};