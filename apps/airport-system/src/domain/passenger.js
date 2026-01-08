class Passenger {
  #money;

  constructor({ name, idNumber, money }) {
    this.name = name;
    this.idNumber = idNumber;
    this.#money = money;
  }

  get money() {
    return this.#money;
  }

  canAfford(amount) {
    return this.#money >= amount;
  }

  charge(amount) {
    if (!this.canAfford(amount)) {
      return false;
    }
    this.#money -= amount;
    return true;
  }

  getTicketPrice(ticket) {
    return ticket.price;
  }

  buyTicket(flight, ticketType) {
    const ticket = flight.findAvailableTicket(ticketType);
    if (!ticket) {
      return false;
    }

    const priceToPay = this.getTicketPrice(ticket);
    if (!this.charge(priceToPay)) {
      return false;
    }

    ticket.setOwner(this.name);
    return ticket;
  }
}

class StudentPassenger extends Passenger {
  constructor({ name, idNumber, money, schoolName }) {
    super({ name, idNumber, money });
    this.schoolName = schoolName;
  }

  getTicketPrice(ticket) {
    if (ticket.type === "regular") {
      return Number((ticket.price * 0.9).toFixed(2));
    }
    return ticket.price;
  }
}

class RegularPassenger extends Passenger {
  constructor({ name, idNumber, money, workplace, knowsEmployee }) {
    super({ name, idNumber, money });
    this.workplace = workplace;
    this.knowsEmployee = knowsEmployee;
  }

  getTicketPrice(ticket) {
    if (!this.knowsEmployee) {
      return ticket.price;
    }

    const discount = ticket.type === "vip" ? 0.15 : 0.2;
    return Number((ticket.price * (1 - discount)).toFixed(2));
  }
}

module.exports = {
  Passenger,
  StudentPassenger,
  RegularPassenger,
};
