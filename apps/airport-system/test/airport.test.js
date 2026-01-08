const test = require("node:test");
const assert = require("node:assert/strict");

const { Flight } = require("../src/domain/flight");
const { RegularPassenger, StudentPassenger } = require("../src/domain/passenger");

const createFlightWithTickets = () => {
  const flight = new Flight({
    name: "Test Flight",
    airline: "TestAir",
    flightNumber: "TA-1",
    maxPassengers: 10,
    regularPrice: 100,
    vipPrice: 300,
  });

  flight.seedTickets({ regularCount: 9, vipCount: 1 });
  return flight;
};

test("returns false when passenger does not have enough money", () => {
  const flight = createFlightWithTickets();
  const student = new StudentPassenger({
    name: "Rina",
    idNumber: "S-1",
    money: 50,
    schoolName: "TAU",
  });

  const result = student.buyTicket(flight, "vip");

  assert.equal(result, false);
  assert.equal(student.money, 50);
  const vipTicket = flight.findAvailableTicket("vip");
  assert.equal(vipTicket.ownerName, null);
});

test("deducts money and assigns owner when enough money", () => {
  const flight = createFlightWithTickets();
  const regularPassenger = new RegularPassenger({
    name: "Avi",
    idNumber: "R-2",
    money: 200,
    workplace: "Acme",
    knowsEmployee: true,
  });

  const ticket = regularPassenger.buyTicket(flight, "regular");

  assert.ok(ticket);
  assert.equal(ticket.ownerName, "Avi");
  assert.equal(regularPassenger.money, 120);
});
