import { Injectable } from "@angular/core";
import { SeatStatus, VenueData } from "../models/seats.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  getSeatMapConfigMobile(): VenueData {
    return {
      sections: [
        {
          id: "1",
          name: 'SILVER',
          x: 50,
          y: 500,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9'
            }
          ]
        },
        {
          id: "2",
          name: 'GOLD',
          x: 200,
          y: 400,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 18,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },
        {
          id: "3",
          name: 'VIP',
          x: 450,
          y: 300,
          rows: 3,
          seatsPerRow: 21,
          sectionLabel: 'VIP',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c'
            }
          ]
        },
        {
          id: "3",
          name: 'DIAMOND',
          x: 450,
          y: 550,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 11,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            }
          ]
        },
        {
          id: "4",
          name: 'DIAMOND',
          x: 700,
          y: 550,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 11,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            }
          ]
        },
        {
          id: "5",
          name: 'GOLD',
          x: 950,
          y: 400,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 18,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },
        {
          id: "6",
          name: 'SILVER',
          x: 1200,
          y: 500,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9'
            }
          ]
        },
        {
          id: "4",
          name: 'FOH',
          x: 450,
          y: 1400,
          rows: 2,
          seatsPerRow: 21,
          sectionLabel: 'FOH',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,
              type: 'FOH',
              customPrice: 0,
              color: '#d4d4d4ff'
            }
          ]
        },
      ],

      seatManagement: {
        reservedSeats: [
          { seatId: 'VIP-A-1', status: SeatStatus.RESERVED, reason: 'VIP_GUEST', reservationId: 'RES-001' },
          { seatId: 'VIP-A-2', status: SeatStatus.RESERVED, reason: 'ARTIST_GUEST', reservationId: 'RES-002' },
          { seatId: 'DIAMOND-D-5', status: SeatStatus.RESERVED, reason: 'PRESS', reservationId: 'RES-003' }
        ],

        blockedSeats: [
          { seatId: 'GOLD-A-1', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'SILVER-B-3', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
          { seatId: 'GOLD-C-5', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' }
        ],

        soldSeats: [
          { seatId: 'VIP-A-5', status: SeatStatus.SOLD, bookingId: 'BK001' },
          { seatId: 'VIP-A-6', status: SeatStatus.SOLD, bookingId: 'BK002' },
          { seatId: 'DIAMOND-D-8', status: SeatStatus.SOLD, bookingId: 'BK003' },
          { seatId: 'DIAMOND-D-9', status: SeatStatus.SOLD, bookingId: 'BK004' },
          { seatId: 'GOLD-B-4', status: SeatStatus.SOLD, bookingId: 'BK005' },
          { seatId: 'SILVER-C-2', status: SeatStatus.SOLD, bookingId: 'BK006' }
        ]
      }
    };
  }

  getSeatMapConfig(): VenueData {
    return {
      sections: [
        {
          id: "1",
          name: 'SILVER',
          x: 50,
          y: 250,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9'
            }
          ]
        },
        {
          id: "2",
          name: 'GOLD',
          x: 200,
          y: 200,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 18,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },
        {
          id: "3",
          name: 'VIP',
          x: 450,
          y: 150,
          rows: 3,
          seatsPerRow: 21,
          sectionLabel: 'VIP',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c'
            }
          ]
        },
        {
          id: "3",
          name: 'DIAMOND',
          x: 450,
          y: 250,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 11,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            }
          ]
        },
        {
          id: "4",
          name: 'DIAMOND',
          x: 700,
          y: 250,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 11,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            }
          ]
        },
        {
          id: "5",
          name: 'GOLD',
          x: 950,
          y: 200,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 18,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },
        {
          id: "6",
          name: 'SILVER',
          x: 1200,
          y: 250,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9'
            }
          ]
        },
        {
          id: "4",
          name: 'FOH',
          x: 450,
          y: 550,
          rows: 2,
          seatsPerRow: 21,
          sectionLabel: 'FOH',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,
              type: 'FOH',
              customPrice: 0,
              color: '#d4d4d4ff'
            }
          ]
        },
      ],

      seatManagement: {
        reservedSeats: [
          { seatId: 'VIP-A-1', status: SeatStatus.RESERVED, reason: 'VIP_GUEST', reservationId: 'RES-001' },
          { seatId: 'VIP-A-2', status: SeatStatus.RESERVED, reason: 'ARTIST_GUEST', reservationId: 'RES-002' },
          { seatId: 'DIAMOND-D-5', status: SeatStatus.RESERVED, reason: 'PRESS', reservationId: 'RES-003' }
        ],

        blockedSeats: [
          { seatId: 'GOLD-A-1', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'SILVER-B-3', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
          { seatId: 'GOLD-C-5', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' }
        ],

        soldSeats: [
          { seatId: 'VIP-A-5', status: SeatStatus.SOLD, bookingId: 'BK001' },
          { seatId: 'VIP-A-6', status: SeatStatus.SOLD, bookingId: 'BK002' },
          { seatId: 'DIAMOND-D-8', status: SeatStatus.SOLD, bookingId: 'BK003' },
          { seatId: 'DIAMOND-D-9', status: SeatStatus.SOLD, bookingId: 'BK004' },
          { seatId: 'GOLD-B-4', status: SeatStatus.SOLD, bookingId: 'BK005' },
          { seatId: 'SILVER-C-2', status: SeatStatus.SOLD, bookingId: 'BK006' }
        ]
      }
    };
  }

  getSeatMapConfigLeicester(): VenueData {
    return {
      sections: [
        // Left Standing Area
        {
          id: "left-standing",
          name: 'STANDING',
          x: 50,
          y: 150,
          rows: 20,
          seatsPerRow: 12,
          sectionLabel: 'Standing',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'STANDING',
              customPrice: 20,
              color: '#666666'
            }
          ]
        },

        // Left Seating Section (A-V rows)
        {
          id: "left-seating",
          name: 'LEFT_SECTION',
          x: 350,
          y: 150,
          rows: 22,  // A to V = 22 rows
          seatsPerRow: 12,
          sectionLabel: 'Left',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,  // Rows A-C: VIP
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c'
            },
            {
              fromRow: 3,
              toRow: 9,  // Rows D-J: Diamond
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            },
            {
              fromRow: 10,
              toRow: 21,  // Rows K-V: Gold
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },

        // Right Seating Section (A-V rows)
        {
          id: "right-seating",
          name: 'RIGHT_SECTION',
          x: 650,
          y: 150,
          rows: 22,  // A to V = 22 rows
          seatsPerRow: 12,
          sectionLabel: 'Right',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 2,  // Rows A-C: VIP
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c'
            },
            {
              fromRow: 3,
              toRow: 9,  // Rows D-J: Diamond
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b'
            },
            {
              fromRow: 10,
              toRow: 21,  // Rows K-V: Gold
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a'
            }
          ]
        },

        // Right Standing Area
        {
          id: "right-standing",
          name: 'STANDING',
          x: 950,
          y: 150,
          rows: 20,
          seatsPerRow: 12,
          sectionLabel: 'Standing',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 19,
              type: 'STANDING',
              customPrice: 20,
              color: '#666666'
            }
          ]
        },

        // Center FOH Area
        {
          id: "foh-center",
          name: 'FOH',
          x: 350,
          y: 680,
          rows: 2,
          seatsPerRow: 26,
          sectionLabel: 'FOH',
          rowConfigs: [
            {
              fromRow: 0,
              toRow: 1,
              type: 'FOH',
              customPrice: 0,
              color: '#d4d4d4'
            }
          ]
        }
      ],

      seatManagement: {
        reservedSeats: [
          { seatId: 'LEFT_SECTION-A-1', status: SeatStatus.RESERVED, reason: 'VIP_GUEST', reservationId: 'RES-001' },
          { seatId: 'LEFT_SECTION-A-2', status: SeatStatus.RESERVED, reason: 'ARTIST_GUEST', reservationId: 'RES-002' },
          { seatId: 'LEFT_SECTION-D-5', status: SeatStatus.RESERVED, reason: 'PRESS', reservationId: 'RES-003' },
          { seatId: 'RIGHT_SECTION-A-1', status: SeatStatus.RESERVED, reason: 'VIP_GUEST', reservationId: 'RES-004' }
        ],

        blockedSeats: [
          { seatId: 'LEFT_SECTION-K-1', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'RIGHT_SECTION-K-1', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'LEFT_SECTION-V-12', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
          { seatId: 'RIGHT_SECTION-V-12', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' }
        ],

        soldSeats: [
          { seatId: 'LEFT_SECTION-A-5', status: SeatStatus.SOLD, bookingId: 'BK001' },
          { seatId: 'LEFT_SECTION-A-6', status: SeatStatus.SOLD, bookingId: 'BK002' },
          { seatId: 'LEFT_SECTION-D-8', status: SeatStatus.SOLD, bookingId: 'BK003' },
          { seatId: 'LEFT_SECTION-D-9', status: SeatStatus.SOLD, bookingId: 'BK004' },
          { seatId: 'LEFT_SECTION-K-4', status: SeatStatus.SOLD, bookingId: 'BK005' },
          { seatId: 'RIGHT_SECTION-A-3', status: SeatStatus.SOLD, bookingId: 'BK006' },
          { seatId: 'RIGHT_SECTION-A-4', status: SeatStatus.SOLD, bookingId: 'BK007' },
          { seatId: 'RIGHT_SECTION-D-7', status: SeatStatus.SOLD, bookingId: 'BK008' },
          { seatId: 'RIGHT_SECTION-K-2', status: SeatStatus.SOLD, bookingId: 'BK009' },
          { seatId: 'RIGHT_SECTION-K-3', status: SeatStatus.SOLD, bookingId: 'BK010' }
        ]
      }
    };
  }

}