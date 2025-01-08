const sendToken = (user, statuscode, res, message = 'success') => {

    const token = user.getJwtToken();

    res.status(statuscode).json({
        user,
        success: true,
        token,
        message,
    })
}

module.exports = sendToken;