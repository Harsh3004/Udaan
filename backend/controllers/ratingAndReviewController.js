const courseModel = require('../models/courseModel');
const ratingAndReviewModel = require('../models/ratingAndReviewModel');

exports.addRatingReview = async (req,res) => {
    try{
        const {rating,review} = req.body;

        const userId = req.user.id;
        console.log(userId);
        const courseId = req.params.courseId;
        console.log(courseId);

        if(!rating || !userId || !courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const courseDetails = await courseModel.findById(courseId)
        .populate('ratingAndReviews')
        .exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course Not Found`
            })
        }

        if(!courseDetails.studentEnrolled.includes(userId)){
            return res.status(403).json({
                success: false,
                message: `Only enrolled Student can post rating and review`
            })
        }

        const existingReview = courseDetails.ratingAndReviews.find(
            (review) => {review.user.toString() == userId.toString()}
        )

        if(existingReview){
            return res.status(400).json({
                success: false,
                message: `User Already reviewed course`
            })
        }

        const response = await ratingAndReviewModel.create({
            rating,
            review,
            userId
        });

        const course = await courseModel.findByIdAndUpdate(
            courseId,
            {$push: {ratingAndReviews: response._id}},
            {new: true}
        );

        return res.status(201).json({
            success: true,
            message: `Rating and Review Posted Successfully`,
            response
        })

    }catch{error}{
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        })
    }
}

exports.averageRating = async (req,res) => {
    try{
        const courseId = req.params.courseId;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const courseDetails = await courseModel.findById(courseId).populate('ratingAndReviews').exec();
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        let rating = 0;
        for(const rating of courseDetails.ratingAndReviews){
            rating += rating.rating;
        }

        const averageRating = rating/(courseDetails.ratingAndReviews.length*5);

        return res.status(200).json({
            success: true,
            message: `Average rating calculated successfully`,
            averageRating
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Error while calculating average rating: ${error.message}`
        })
    }
}

exports.showAllRatingAndReview = async(req,res)=>{
    try{
        const courseId = req.params.courseId;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }
        
        // options: { sort: { rating: -1 } } → sorts the populated documents by rating in decreasing order.
        const courseDetails = await courseModel.findById(courseId)
        .populate({
            path: 'ratingAndReviews',
            options: { sort: { rating: -1 } }
        })
        .exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        return res.status(200).json({
            success: true,
            message: `All rating and review fetched successfully`,
            ratingAndReviews: courseDetails.ratingAndReviews
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Error while fetching rating and review: ${error.message}`
        })
    }
}