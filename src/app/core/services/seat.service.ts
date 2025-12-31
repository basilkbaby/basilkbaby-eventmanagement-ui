import { Injectable } from "@angular/core";
import { RowNumberingType, SeatSectionType, SeatStatus, VenueData } from "../models/seats.model";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = `${environment.apiUrl}/api/seat`;

  constructor(private http: HttpClient) { }


  getSeatMapConfigMobile(): VenueData {
    return {
      eventName: "event name",
      eventDate: new Date('2026-01-15'),
      sections: [
        {
          id: "1",
          name: 'SILVER',
          x: 50,
          y: 500,
          mx: 50,
          my: 500,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 200,
          my: 400,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 18,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 450,
          my: 300,
          rows: 3,
          seatsPerRow: 21,
          sectionLabel: 'VIP',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 450,
          my: 550,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 11,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 700,
          my: 550,
          rows: 12,
          seatsPerRow: 10,
          sectionLabel: 'DIAMOND',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 11,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 950,
          my: 400,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 18,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 1200,
          my: 500,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 450,
          my: 1400,
          rows: 2,
          seatsPerRow: 21,
          sectionLabel: 'FOH',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 0,
              toColumn: 0,
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
          { seatId: 'DIAMOND-A-11', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'DIAMOND-B-11', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
          { seatId: 'DIAMOND-C-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-D-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-E-11', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
          { seatId: 'DIAMOND-F-11', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
          { seatId: 'DIAMOND-G-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-H-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-I-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-J-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-K-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' },
          { seatId: 'DIAMOND-L-11', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' }
        ],

        soldSeats: [
          { seatId: 'VIP-A-5', status: SeatStatus.BOOKED, bookingId: 'BK001' },
          { seatId: 'VIP-A-6', status: SeatStatus.BOOKED, bookingId: 'BK002' },
          { seatId: 'DIAMOND-D-8', status: SeatStatus.BOOKED, bookingId: 'BK003' },
          { seatId: 'DIAMOND-D-9', status: SeatStatus.BOOKED, bookingId: 'BK004' },
          { seatId: 'GOLD-B-4', status: SeatStatus.BOOKED, bookingId: 'BK005' },
          { seatId: 'SILVER-C-2', status: SeatStatus.BOOKED, bookingId: 'BK006' }
        ]
      }
    };
  }

  getSeatMapConfig(): VenueData {
    return {
      eventName: "Event Name",
      eventDate: new Date('2026-01-15'),
      sections: [
        // LEFT SILVER SECTION - Split into 2 blocks with a gap
        {
          id: "1",
          name: 'SILVER',
          x: 50,
          y: 250,
          mx: 50,
          my: 250,
          rows: 20,
          seatsPerRow: 5, // Total seats including gaps
          sectionLabel: 'Silver',
          numberingDirection: 'right', // Will auto-set to 'right' (right-to-left)
          rowConfigs: [
            // First block: columns 1-3
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 0,
              toColumn: 5,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9',
              blockLetter: 'L', // Explicitly set to L
              numberingDirection: 'right'
            }
          ]
        },
        // LEFT GOLD SECTION - Split into 3 blocks
        {
          id: "2",
          name: 'GOLD',
          x: 200,
          y: 200,
          mx: 200,
          my: 200,
          rows: 19,
          seatsPerRow: 10, // Total seats including gaps
          rowOffset: 0,
          sectionLabel: 'Gold',
          numberingDirection: 'auto', // Will auto-set to 'right'
          rowConfigs: [
            // First block
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 18,
              fromColumn: 1,
              toColumn: 10,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a',
              blockLetter: 'L',
              numberingDirection: 'right'
            }
          ]
        },
        // VIP SECTION (Middle - Center numbering)
        {
          id: "3",
          name: 'VIP',
          x: 460,
          y: 150,
          mx: 450,
          my: 150,
          rows: 3,
          seatsPerRow: 20,
          sectionLabel: 'VIP',
          numberingDirection: 'right', // Center-outward numbering
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 1,
              toColumn: 11,
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c',
              blockLetter: 'L',
              numberingDirection: 'right'
            },
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 10,
              toColumn: 19,
              type: 'VIP',
              customPrice: 75,
              color: '#8a6b8c',
              blockLetter: 'R',
              numberingDirection: 'left'
            }
          ]
        },
        // LEFT DIAMOND SECTION
        {
          id: "4",
          name: 'DIAMOND',
          x: 460,
          y: 250,
          mx: 450,
          my: 250,
          rows: 12,
          seatsPerRow: 15, // With gaps
          sectionLabel: 'DIAMOND',
          numberingDirection: 'right', // Explicitly right-to-left
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 11,
              fromColumn: 1,
              toColumn: 10,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b',
              blockLetter: 'L',
              numberingDirection: 'right'
            },
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 11,
              fromColumn: 10,
              toColumn: 19,
              type: 'DIAMOND',
              customPrice: 50,
              color: '#8a9a5b',
              blockLetter: 'R',
              numberingDirection: 'left'
            }
          ]
        },
        // RIGHT GOLD SECTION
        {
          id: "6",
          name: 'GOLD',
          x: 1000,
          y: 200,
          mx: 950,
          my: 200,
          rows: 19,
          seatsPerRow: 10,
          rowOffset: 0,
          sectionLabel: 'Gold',
          numberingDirection: 'left', // Left-to-right
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 18,
              fromColumn: 1,
              toColumn: 10,
              type: 'GOLD',
              customPrice: 30,
              color: '#b3543a',
              blockLetter: 'R',
              numberingDirection: 'left'
            }
          ]
        },
        // RIGHT SILVER SECTION
        {
          id: "7",
          name: 'SILVER',
          x: 1250,
          y: 250,
          mx: 1200,
          my: 250,
          rows: 20,
          seatsPerRow: 5,
          sectionLabel: 'Silver',
          numberingDirection: 'left', // Left-to-right
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 1,
              toColumn: 5,
              type: 'SILVER',
              customPrice: 25,
              color: '#4a8bc9',
              blockLetter: 'R',
              numberingDirection: 'left'
            }
          ]
        },
        {
          id: "8",
          name: 'FOH',
          x: 450,
          y: 550,
          mx: 450,
          my: 550,
          rows: 2,
          seatsPerRow: 21,
          sectionLabel: 'FOH',
          seatSectionType: SeatSectionType.FOH,
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 1,
              fromColumn: 0,
              toColumn: 0,
              type: 'FOH',
              customPrice: 0,
              color: '#d4d4d4ff'
            }
          ]
        }
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
          { seatId: 'VIP-A-5', status: SeatStatus.BOOKED, bookingId: 'BK001' },
          { seatId: 'VIP-A-6', status: SeatStatus.BOOKED, bookingId: 'BK002' },
          { seatId: 'DIAMOND-D-8', status: SeatStatus.BOOKED, bookingId: 'BK003' },
          { seatId: 'DIAMOND-D-9', status: SeatStatus.BOOKED, bookingId: 'BK004' },
          { seatId: 'GOLD-B-4', status: SeatStatus.BOOKED, bookingId: 'BK005' },
          { seatId: 'SILVER-C-2', status: SeatStatus.BOOKED, bookingId: 'BK006' }
        ]
      }
    };
  }

  getSeatMapConfigContinous(): VenueData {
    return {
      eventName: "Event Name",
      eventDate: new Date('2026-01-15'),
      sections: [
        // LEFT SILVER SECTION - Split into 2 blocks with a gap
 {
      id: "1",
      name: 'VIP',
      x: 450,
      y: 100,
      mx: 500,
      my: 150,
      rows: 2,
      seatsPerRow: 24,
      sectionLabel: 'VIP',
      numberingDirection: 'right',
      
      // Section-level configuration
      skipRowLetters: ["I"],       // Skip letter I
      hasColumnGap: true,          // Enable column gap
      gapAfterColumn: 12,          // Gap after column 12
      gapSize: 1,                  // 1 column gap
      rowNumberingType : RowNumberingType.CONTINUOUS,
      rowConfigs: [
        {
          id: crypto.randomUUID(),
          fromRow: 0,
          toRow: 1,
          fromColumn: 1,
          toColumn: 24,
          type: 'VIP',
          customPrice: 75,
          color: '#4a8bc9',
          blockLetter: 'L',
          numberingDirection: 'right',
          gapAfterColumn: 12,
          gapSize: 1
          // Inherits skipRowLetters and column gap from section
        }
      ]
    }, 
    {
      id: "4",
      name: 'DIAMOND',
      x: 450,
      y: 200,
      mx: 500,
      my: 250,
      rows: 5,
      seatsPerRow: 24,
      sectionLabel: 'DIAMOND',
      numberingDirection: 'right',
      rowNumberingType : RowNumberingType.CONTINUOUS,
      
      // Skip I and O
      skipRowLetters: ["I", "O"],
      hasColumnGap: true,
      gapAfterColumn: 12,
      gapSize: 1,
      
      rowConfigs: [
        {
          id: crypto.randomUUID(),
          fromRow: 0,
          toRow: 4, // Will produce: A, B, C, D, E, F, G, H, J (skips I)
          fromColumn: 1,
          toColumn: 24,
          type: 'DIAMOND',
          customPrice: 50,
          color: '#8a9a5b',
          blockLetter: 'L',
          numberingDirection: 'right',
          gapAfterColumn: 12,
          gapSize: 1
        }
      ]
    },
    {
      id: "2",
      name: 'GOLD',
      x: 450,
      y: 350,
      mx: 500,
      my: 490,
      rows: 10,
      seatsPerRow: 24,
      rowOffset: 0,
      sectionLabel: 'Gold',
      numberingDirection: 'auto',
      rowNumberingType : RowNumberingType.CONTINUOUS,
      
      // No column gap for this section
      skipRowLetters: ["I", "O"],
      hasColumnGap: false,
      
      rowConfigs: [
        {
          id: crypto.randomUUID(),
          fromRow: 0,
          toRow: 9, // A, B, C, D, E, F, G, H, J, K, L, M, N, P, Q (skips I and O)
          fromColumn: 1,
          toColumn: 24,
          type: 'GOLD',
          customPrice: 35,
          color: '#b3543a',
          blockLetter: 'L',      
          skipRowLetters: ["I", "O"], // Override to skip O as well
          numberingDirection: 'right',
          gapAfterColumn: 12,
          gapSize: 1
        }
      ]
    },
    {
      id: "7",
      name: 'SILVER',
      x: 450,
      y: 600,
      mx: 500,
      my: 950,
      rows: 4,
      seatsPerRow: 24,
      sectionLabel: 'Silver',
      numberingDirection: 'right',
      rowNumberingType : RowNumberingType.CONTINUOUS,
      
      // Row config overrides section
      rowConfigs: [
        {
          id: crypto.randomUUID(),
          fromRow: 0,
          toRow: 3,
          fromColumn: 1,
          toColumn: 24,
          type: 'SILVER',
          customPrice: 25,
          color: '#4a8bc9',
          blockLetter: 'R',
          numberingDirection: 'right',
          // Row config-specific: different gap
          hasColumnGap: true,
          gapAfterColumn: 12, // Gap after seat 8
          gapSize: 1
        }
      ]
    },
    {
      id: "8",
      name: 'BALCONY',
      x: 400,
      y: 720,
      mx: 450,
      my: 1150,
      rows: 12,
      seatsPerRow: 30,
      sectionLabel: 'BALCONY',
      rowNumberingType: RowNumberingType.PERSECTION,
      numberingDirection: 'right', 
      skipRowLetters: ["I"],
      
      rowConfigs: [
        {
          id: crypto.randomUUID(),
          fromRow: 0,
          toRow: 11,
          fromColumn: 1,
          toColumn: 30,
          type: 'BALCONY',
          customPrice: 30,
          color: '#8B7B9E',
          blockLetter: 'R',
          numberingDirection: 'right',
          skipRowLetters: ["I"], // Skip I in this block only
          hasColumnGap: true,
          gapAfterColumn: 15,
          gapSize: 1
        }
      ]
    }
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
          { seatId: 'VIP-A-5', status: SeatStatus.BOOKED, bookingId: 'BK001' },
          { seatId: 'VIP-A-6', status: SeatStatus.BOOKED, bookingId: 'BK002' },
          { seatId: 'DIAMOND-D-8', status: SeatStatus.BOOKED, bookingId: 'BK003' },
          { seatId: 'DIAMOND-D-9', status: SeatStatus.BOOKED, bookingId: 'BK004' },
          { seatId: 'GOLD-B-4', status: SeatStatus.BOOKED, bookingId: 'BK005' },
          { seatId: 'SILVER-C-2', status: SeatStatus.BOOKED, bookingId: 'BK006' }
        ]
      }
    };
  }

  getSeatMapConfigLeicester(): VenueData {
    return {
      eventName: "event name",
      eventDate: new Date('2026-01-15'),
      sections: [
        // Left Standing Area
        {
          id: "left-standing",
          name: 'STANDING',
          x: 50,
          y: 150,
          mx: 275,
          my: 150,
          rows: 20,
          seatsPerRow: 12,
          sectionLabel: 'Standing',
          seatSectionType: SeatSectionType.STANDING,
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 0,
              toColumn: 0,
              type: 'STANDING',
              customPrice: 20,
              color: '#666666'
            }
          ]
        },

        // Left Seating Section (A-V rows)
        {
          id: "left-seating",
          name: 'VIP',
          x: 350,
          y: 150,
          mx: 500,
          my: 150,
          rows: 3,  // A to V = 22 rows
          seatsPerRow: 24,
          sectionLabel: 'VIP',
          numberingDirection: 'right',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 1,
              toColumn: 12,  // Rows A-C: VIP
              type: 'VIP',
              customPrice: 75,
              color: '#4a8bc9',
              blockLetter: 'L',
              numberingDirection: 'right',
            },
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 2,
              fromColumn: 12,
              toColumn: 24,  // Rows A-C: VIP
              type: 'VIP',
              customPrice: 75,
              color: '#4a8bc9',
              blockLetter: 'R',
              numberingDirection: 'left',
            }
          ]
        },

        // Right Seating Section (A-V rows)
        {
          id: "right-seating",
          name: 'Diamond',
          x: 350,
          y: 250,
          mx: 500,
          my: 300,
          rows: 7,  // A to V = 22 rows
          seatsPerRow: 24,
          sectionLabel: 'Diamond',
          numberingDirection: 'right',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 6,
              fromColumn: 1,
              toColumn: 12, // Rows A-C: VIP
              type: 'DIAMOND',
              customPrice: 75,
              color: '#8a6b8c',
              blockLetter: 'L',
              numberingDirection: 'right',
            },
            
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 6,
              fromColumn: 12,
              toColumn: 24, // Rows A-C: VIP
              type: 'DIAMOND',
              customPrice: 75,
              color: '#8a6b8c',
              blockLetter: 'R',
              numberingDirection: 'left',
            }
          ]
        },

        // Right Seating Section (A-V rows)
        {
          id: "right-seating",
          name: 'Gold',
          x: 350,
          y: 450,
          mx: 650,
          my: 150,
          rows: 7,  // A to V = 22 rows
          seatsPerRow: 24,
          sectionLabel: 'Gold',
          numberingDirection: 'right',
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 6,
              fromColumn: 0,
              toColumn: 12, // Rows A-C: VIP
              type: 'GOLD',
              customPrice: 75,
              color: '#b3543a',
              blockLetter: 'L',
              numberingDirection: 'right',
            },     
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 6,
              fromColumn: 12,
              toColumn: 24, // Rows A-C: VIP
              type: 'GOLD',
              customPrice: 75,
              color: '#b3543a',
              blockLetter: 'R',
              numberingDirection: 'left',
            }
          ]
        },


        // Right Standing Area
        {
          id: "right-standing",
          name: 'STANDING',
          x: 950,
          y: 150,
          mx: 950,
          my: 150,
          rows: 20,
          seatsPerRow: 12,
          sectionLabel: 'Standing',
          seatSectionType: SeatSectionType.STANDING,
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 19,
              fromColumn: 0,
              toColumn: 0,
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
          mx: 350,
          my: 680,
          rows: 2,
          seatsPerRow: 26,
          sectionLabel: 'FOH',
          seatSectionType : SeatSectionType.FOH,
          rowConfigs: [
            {
              id: crypto.randomUUID(),
              fromRow: 0,
              toRow: 1,
              fromColumn: 0,
              toColumn: 0,
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
          { seatId: 'LEFT_SECTION-A-5', status: SeatStatus.BOOKED, bookingId: 'BK001' },
          { seatId: 'LEFT_SECTION-A-6', status: SeatStatus.BOOKED, bookingId: 'BK002' },
          { seatId: 'LEFT_SECTION-D-8', status: SeatStatus.BOOKED, bookingId: 'BK003' },
          { seatId: 'LEFT_SECTION-D-9', status: SeatStatus.BOOKED, bookingId: 'BK004' },
          { seatId: 'LEFT_SECTION-K-4', status: SeatStatus.BOOKED, bookingId: 'BK005' },
          { seatId: 'RIGHT_SECTION-A-3', status: SeatStatus.BOOKED, bookingId: 'BK006' },
          { seatId: 'RIGHT_SECTION-A-4', status: SeatStatus.BOOKED, bookingId: 'BK007' },
          { seatId: 'RIGHT_SECTION-D-7', status: SeatStatus.BOOKED, bookingId: 'BK008' },
          { seatId: 'RIGHT_SECTION-K-2', status: SeatStatus.BOOKED, bookingId: 'BK009' },
          { seatId: 'RIGHT_SECTION-K-3', status: SeatStatus.BOOKED, bookingId: 'BK010' }
        ]
      }
    };
  }


  // Main seat map endpoint
  getSeatMap(eventId: string): Observable<VenueData> {
    return this.http.get<VenueData>(`${this.apiUrl}/map/${eventId}`);
  }


}