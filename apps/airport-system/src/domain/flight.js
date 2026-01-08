const { RegularTicket, VipTicket } = require("./ticket");

const generateTicketNumber = () => Math.floor(Math.random() * 1_000_000);

class Flight {
  constructor({ name, airline, flightNumber, maxPassengers, regularPrice, vipPrice }) {
    this.name = name;
    this.airline = airline;
    this.flightNumber = flightNumber;
    this.maxPassengers = maxPassengers;
    this.regularPrice = regularPrice;
    this.vipPrice = vipPrice;
    this.tickets = [];
  }

  seedTickets({ regularCount, vipCount }) {
    this.tickets = [];
    for (let i = 0; i < regularCount; i += 1) {
      this.tickets.push(
        new RegularTicket({
          number: generateTicketNumber(),
          price: this.regularPrice,
        }),
      );
    }

    for (let i = 0; i < vipCount; i += 1) {
      this.tickets.push(
        new VipTicket({
          number: generateTicketNumber(),
          price: this.vipPrice,
        }),
      );
    }

    if (this.tickets.length !== this.maxPassengers) {
      throw new Error("Ticket count must match max passengers");
    }
  }

  findAvailableTicket(type) {
    return this.tickets.find(
      (ticket) => ticket.type === type && ticket.ownerName === null,
    );
  }
}

module.exports = { Flight };
