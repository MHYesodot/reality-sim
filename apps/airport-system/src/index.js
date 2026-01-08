const { Airport } = require("./system/airport");
const { Flight } = require("./domain/flight");
const { Passenger, StudentPassenger, RegularPassenger } = require("./domain/passenger");
const { Ticket, RegularTicket, VipTicket } = require("./domain/ticket");

module.exports = {
  Airport,
  Flight,
  Passenger,
  StudentPassenger,
  RegularPassenger,
  Ticket,
  RegularTicket,
  VipTicket,
};
