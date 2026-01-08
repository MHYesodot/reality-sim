class Ticket {
  constructor({ number, price, ownerName = null }) {
    this.number = number;
    this.price = price;
    this.ownerName = ownerName;
  }

  setOwner(name) {
    this.ownerName = name;
  }
}

class RegularTicket extends Ticket {
  constructor({ number, price }) {
    super({ number, price });
    this.type = "regular";
  }
}

class VipTicket extends Ticket {
  constructor({ number, price }) {
    super({ number, price });
    this.type = "vip";
    this.benefits = ["Free alcohol", "Free food", "Hot towels"];
  }
}

module.exports = {
  Ticket,
  RegularTicket,
  VipTicket,
};
