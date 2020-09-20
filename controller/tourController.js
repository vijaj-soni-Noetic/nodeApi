const mongoose = require('mongoose');
const tourModel = require('./../model/tourModel');
const APIFeatures  = require('./../utils/apiFeatures');


exports.aliasTopTours = (req,res, next) =>{
    req.query.limit = '5';
    req.query.sort ='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req,res)=>{
    try{
       // 1. filtering data 
    //    const queryObj = { ...req.query };
    //    const excludeFields = ['page','sort','limit','fields'];
    //    excludeFields.forEach(el =>delete queryObj[el]);
    //        // const query = Tour.find(queryObj);
        
    //        let queryStr = JSON.stringify(queryObj);        
    //     queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);
          
    //    let query =  tourModel.find(JSON.parse(queryStr));
       //2 Sorting
    //    if(req.query.sort){
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    //     }else{
    //         query = query.sort('-createdAt');
    //     }

        // 3. fields limits
        // if(req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{ 
        //     query = query.select('-__v');
        // }
       
        // 4. pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await tourModel.countDocuments();
        //     if(skip >= numTours) throw new Error('This page does not exist');
        // }

        const features = new APIFeatures(tourModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

       const tours = await features.query;
       
        res.status(200).json({
            result: tours.length,
            status:"success",
            data: tours
        })
    }
    catch(err){
        res.json({
            message: "err",
           
        })
    }
    
};

exports.getTour = async (req, res) =>{
    try{
        const id = req.params.id;
    const tour = await tourModel.findById(id);
    if(!tour){
        res.status(400).json({
            message: 'Invalid Id'
        })
    }
    res.status(200).json({
        status:"success",
        data: tour
    })
    }
    catch(err){
        res.json({
            message: err,
           
        })
    }
    
};

exports.Update = async (req, res) =>{
    try{
        const id = req.params.id;
        const tour = await tourModel.findById(id);
        if(!tour){
            res.status(400).json({
                message: 'Invalid Id'
            })
        }
        else{
            const updatedTour = await tourModel.findByIdAndUpdate(id,{
                name: req.body.name,
            price: req.body.price,
            ratingAverage: req.body.ratingAverage,
            durations: req.body.durations,
            maxGroupSize: req.body.maxGroupSize,
            difficulty: req.body.difficulty,
            ratingQuantity: req.body.ratingQuantity,
            discount: req.body.discount,
            summary: req.body.summary,
            description: req.body.description,
            imageCover: req.body.imageCover,
            images:req.body.images,
            startDates: req.body.startDates
            })

            res.status(200).json({
                status:"success",
                data: updatedTour
            })
        }
    }
    catch(err){
        res.json({
            message: err,
        })
    }
}

exports.Create = async (req, res) => {
    try{
        const tour = await tourModel.create({
            _id : new mongoose.Types.ObjectId,
            name: req.body.name,
            price: req.body.price,
            ratingAverage: req.body.ratingAverage,
            durations: req.body.durations,
            maxGroupSize: req.body.maxGroupSize,
            difficulty: req.body.difficulty,
            ratingQuantity: req.body.ratingQuantity,
            discount: req.body.discount,
            summary: req.body.summary,
            description: req.body.description,
            imageCover: req.body.imageCover,
            images:req.body.images,
            startDates: req.body.startDates

        });
        res.status(201).json({
            status:'success',
            data: tour
        })
    }
    catch(err){
        res.json({
            message: err,
           
        })
    }

};

exports.Delete = async (req, res) =>{
    try{
        const id = req.params.id;
        const tour = await tourModel.findById(id);
        if(!tour){
            res.status(400).json({
                message: 'Invalid Id'
            })
        }
        else{
            const updatedTour = await tourModel.findByIdAndDelete(id)
            res.status(200).json({
                status:"success",
                message: "deleted"
            })
        }
    }
    catch(err){
        res.json({
            message: err,
        })
    }
}

exports.getTourStats = async (req , res)  => {
    try{
        const stats= await tourModel.aggregate([
            {
                $match:{ ratingAverage:{ $gte : 3.5 } }
            },
            {
                $group:{
                    _id : '$difficulty',   //{$toUpper: '$difficulty'}, // give data in upper case
                   num:{$sum: 1},
                   numRatings:{$sum:'$ratingsQuantity'},
                    avgRating:{ $avg: '$ratingAverage' },
                    avgPrice:{ $avg: '$price' },
                    minPrice:{ $min: '$price' },
                    maxPrice:{ $max: '$price' }
                }
            },
            // {
            //     $sort:{ avgPrice: 1} //give the result in acending order
            // },
            // {
            //     $match:{ _id:{ $ne :'EASY' } }
            // }
        ]);
        console.log("-----------",stats)
        res.status(200).json({
            status: 'success',
            data:{
                stats
            }
        });
    }
    catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.grtMonthlyPlan = async (req, res) =>{
    try{
        const year = req.params.year * 1;

        const plan = await tourModel.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match:{
                    startDates: {
                        $gte : new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month: '$startDates'},
                    newTourStarts:{ $sum: 1},
                    tours:{$push: '$name'}
                }
            },
            {
                $addFields:{month:'$_id'}
            },
            // {
            //     $project:{
            //         _id :0
            //     }
            // },
            // {
            //     $sort :{ newTourStarts: -1}
            // },
            // {
            //     $limit : 12
            // }
        ]);
        res.status(200).json({
            data:{
                plan
            }
        });
    }
    catch(err){
        res.status(404).json({
            status:'fail',
            message: err
        })  
    }
}