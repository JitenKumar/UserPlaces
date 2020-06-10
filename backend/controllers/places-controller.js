const fs = require("fs");
const mongoose = require("mongoose");
const HttpError = require("../models/http-errors");
const { validationResult } = require("express-validator");
const getLocationCoordinates = require("../util/location");
const Place = require("../models/place-schema");
const User = require("../models/users-schema");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong, Could Not Find", 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could Not find Place with Provided Id", 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places ;
  try {
    places = await Place.find({creator: userId})
  } 
    catch (err) {
    const error = new HttpError("Something went wrong, Could Not Find", 500);
    return next(error);
  }
  if (!places ||places.length==0) {
    const error = new HttpError("Could Not find Place with User Id", 404);
    return next(error);
  }
  res.json({ places: places.map(place=> place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getLocationCoordinates(address);
  } catch (error) {
    return next(error);
  }
  const createPlace = new Place({
    title,
    description,
    address,  
    location: coordinates,
    image:req.file.path,
    creator: req.userData.userId
  });
  let userExistOrNot;
  try {
    userExistOrNot = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }
  if(!userExistOrNot){
    const error = new HttpError('Could Not find User with Provided Id', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createPlace.save({session});
    userExistOrNot.places.push(createPlace);
    await userExistOrNot.save({session});
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating a new Place failed!!!, Please try again",
      500
    );
    return next(error);
  }
  res.status(201).json({ place: createPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, Could Not Find By Plaec Id",
      500
    );
    return next(error);
  }
  if(updatedPlace.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      "You are not allowd to update this place",
      401
    );
    return next(error);
  }
  updatedPlace.title = title;
  updatedPlace.description = description;
  try {
    await updatedPlace.save();
  } catch (err) {
    const error = new HttpError("Could Not update,Please try again/later", 500);
    return next(error);
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, Could Not Find By Place Id",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
  if(place.creator.id !== req.userData.userId){
    const error = new HttpError(
      "You are not allowd to delete this place",
      401
    );
    return next(error);
  }
  const filePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Could Not delete place,Please try again/later", 500);
    return next(error);
  }
  fs.unlink(filePath,err=>{
    console.log(err);
  });
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
