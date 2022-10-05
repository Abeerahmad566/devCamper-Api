const asyncHandler = require("../Middleware/async");
const errorResponse = require("../utils/errorResponse");
const Bootcamp = require("../Models/Bootcamp")
const BootCamp = require ("../Models/Bootcamp")

//@desc     Get All BootCamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getBootcamps= asyncHandler (async(req,res,next)=>{
        const bootcamps = await Bootcamp.find();
        res.status(200).json({sucess:true,count:bootcamps.length,data:bootcamps})
    
})
//@desc     Get single BootCamps
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getSingleBootcamp= asyncHandler(async(req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp)
        {
             return next(new errorResponse(`BootCamp not Found with id of ${req.params.id}`,404));
        }
            res.status(200).json({sucess:true,data:bootcamp})
})
//@desc     Post BootCamps
//@route    POST /api/v1/bootcamps
//@access   private
exports.postBootcamp= asyncHandler(async(req,res,next)=>{
        const bootcamp= await BootCamp.create(req.body);
        res.status(201).json({sucess:true,data:bootcamp})
})
//@desc     Put BootCamps
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.putBootcamp=asyncHandler (async(req,res,next)=>{
    const bootcamp= await BootCamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        if(!bootcamp)
        {
            return next(new errorResponse(`BootCamp not Found with id of ${req.params.id}`,404));
        }
            res.status(201).json({sucess:true,data:bootcamp})
    
    })
    

//@desc     Delete BootCamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp=asyncHandler(async(req,res,next)=>{
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if(!bootcamp)
        {
            return next(new errorResponse(`BootCamp not Found with id of ${req.params.id}`,404));
        }
            res.status(200).json({sucess:true,data:bootcamp})
    
})