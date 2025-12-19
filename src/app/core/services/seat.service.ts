import { Injectable } from "@angular/core";
import { SeatStatus, VenueData } from "../models/seats.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SeatService 
{
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
            id: "4",
            name: 'DIAMOND', 
            x: 450, 
            y: 550, 
            rows: 12, 
            seatsPerRow: 21,
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
            id: "7",
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
}