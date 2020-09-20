const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');
 
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
// connection seperated database   mongoose
// mongoose.connect(DB,{
//    useNewUrlParser: true,
//    useCreateIndex: true,
//    useFindAndModify: false 
// });
mongoose.connect(process.env.DATABASE_LOCAL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false 
 })
 .then(() => console.log('connected to database'));
//  .then(con => {
//      console.log(con.connections)      // check database connections
//     });


const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`server is runningon port ${port}....`);
});