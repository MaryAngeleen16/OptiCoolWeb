// const mongoose = require('mongoose');

// const connectDatabase = () => {
//     mongoose.connect(process.env.DB_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }).then(con => {
//         console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
//     })
// }

// module.exports = connectDatabase

const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    }).catch(err => {
        console.error('Database connection error:', err);
    });
};

module.exports = connectDatabase;
