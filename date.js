// this is the way create our own modules
module.exports.getDate = getDate;
/* module.exports - exports the whole getDate function
 and i can decide when and where to run it. */

function getDate() {
  const event = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  let day = event.toLocaleDateString('en-US', options);
  return day;
}

module.exports.getDay = getDay;
// wecan use "exports" word without "module"

function getDay() {
  const event = new Date();
  const options = {
    weekday: "long"
  };
  let day = event.toLocaleDateString('en-US', options);
  return day;
}
