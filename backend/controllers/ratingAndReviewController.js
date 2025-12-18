const courseModel = require('../models/courseModel');
const ratingAndReviewModel = require('../models/ratingAndReviewModel');

exports.addRatingReview = async (req,res) => {
    try{
        const {rating,review} = req.body;
        const userId = req.user.id;
        const courseId = req.params.courseId;

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

        if(!courseDetails.studentEnrolled.map(String).includes(userId.toString())){
            return res.status(403).json({
                success: false,
                message: `Only enrolled Student can post rating and review`
            })
        }

        const existingReview = await ratingAndReviewModel.findOne({ course: courseId, user: userId });
        if(existingReview){
            return res.status(400).json({
                success: false,
                message: `User already reviewed this course`
            })
        }

        const response = await ratingAndReviewModel.create({
            rating,
            review,
            user: userId,
            course: courseId
        });

        await courseModel.findByIdAndUpdate(
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

        const ratingsCount = courseDetails.ratingAndReviews.length;
        if(ratingsCount === 0){
            return res.status(200).json({
                success: true,
                message: `No ratings yet`,
                averageRating: 0
            })
        }

        const sum = courseDetails.ratingAndReviews.reduce((acc, cur) => acc + (cur.rating || 0), 0);
        const averageRating = Number((sum / ratingsCount).toFixed(2));

        return res.status(200).json({
            success: true,
            message: `Average rating calculated successfully`,
            averageRating,
            ratingsCount
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