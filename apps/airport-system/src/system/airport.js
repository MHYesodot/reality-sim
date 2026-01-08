const { Flight } = require("../domain/flight");

class Airport {
  constructor() {
    this.flights = [
      new Flight({
        name: "Morning Express",
        airline: "SkyWave",
        flightNumber: "SW-101",
        maxPassengers: 50,
        regularPrice: 220,
        vipPrice: 480,
      }),
      new Flight({
        name: "Sunset Route",
        airline: "NovaAir",
        flightNumber: "NA-208",
        maxPassengers: 40,
        regularPrice: 180,
        vipPrice: 420,
      }),
      new Flight({
        name: "Midnight Cargo",
        airline: "Atlas Flights",
        flightNumber: "AF-777",
        maxPassengers: 30,
        regularPrice: 260,
        vipPrice: 520,
      }),
    ];

    this.flights.forEach((flight) => {
      const vipCount = Math.max(1, Math.round(flight.maxPassengers * 0.1));
      const regularCount = flight.maxPassengers - vipCount;
      flight.seedTickets({ regularCount, vipCount });
    });
  }
}

module.exports = { Airport };
