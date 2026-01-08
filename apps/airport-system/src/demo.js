const { Airport } = require("./system/airport");
const { StudentPassenger, RegularPassenger } = require("./domain/passenger");

const airport = new Airport();

const studentPassenger = new StudentPassenger({
  name: "Dana Levi",
  idNumber: "S-1001",
  money: 600,
  schoolName: "Technion",
});

const regularPassenger = new RegularPassenger({
  name: "Noam Cohen",
  idNumber: "R-2001",
  money: 500,
  workplace: "Orbit Labs",
  knowsEmployee: true,
});

const firstFlight = airport.flights[0];

const regularTicket = regularPassenger.buyTicket(firstFlight, "regular");
const vipTicket = studentPassenger.buyTicket(firstFlight, "vip");

console.log({
  flight: firstFlight.flightNumber,
  regularTicketOwner: regularTicket?.ownerName ?? null,
  vipTicketOwner: vipTicket?.ownerName ?? null,
  studentMoney: studentPassenger.money,
  regularMoney: regularPassenger.money,
});
