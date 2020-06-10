const getLocationCoordinates = async () => {
  return {
    lat: 40.7484405 + Math.random(),
    lng: -73.9878584 + Math.random(),
  };
};
module.exports = getLocationCoordinates;
