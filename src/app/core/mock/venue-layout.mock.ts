// venue-layout.config.ts
export const VENUE_LAYOUT_CONFIG = {
  id: 'classic-theatre',
  name: 'Classic Theatre',
  width: 1200,
  height: 800,
  containerPadding: 40,
  columnWidth: 93.33, // (1200 - 80) / 12
  rowHeight: 150,
  rowGap: 20,
  sections: [
    // Row 1: Stage
    {
      id: 'stage',
      name: 'STAGE',
      type: 'stage',
      color: '#1e293b',
      icon: '🎭',
      width: 12, // Full width
      height: 1, // 1 row tall
      align: 'center'
    },
    
    // Row 2-5: Main seating area (container for standing + seated sections)
    {
      id: 'main-seating-area',
      name: '',
      type: 'container',
      color: 'transparent',
      width: 12,
      height: 4, // Spans 4 rows
      children: [
        // Left standing section (spans all 4 rows)
        {
          id: 'standing-left',
          name: 'STANDING',
          type: 'standing',
          price: 25,
          color: '#10B981',
          icon: '👤',
          width: 2,
          height: 4, // Full height of container
          align: 'left'
        },
        
        // Middle seating sections container
        {
          id: 'middle-seating-container',
          name: '',
          type: 'container',
          color: 'transparent',
          width: 8,
          height: 4,
          children: [
            // VIP Section (top of middle container)
            {
              id: 'vip',
              name: 'VIP',
              type: 'seated',
              price: 75,
              color: '#9333EA',
              icon: '👑',
              width: 8,
              height: 1,
              rows: 6,
              columns: 12,
              hasAisle: true,
              aislePosition: 6,
              align: 'center'
            },
            
            // Diamond Section
            {
              id: 'diamond',
              name: 'DIAMOND',
              type: 'seated',
              price: 50,
              color: '#0EA5E9',
              icon: '💎',
              width: 8,
              height: 1,
              rows: 8,
              columns: 12,
              hasAisle: true,
              aislePosition: 6,
              align: 'center'
            },
            
            // Gold Section
            {
              id: 'gold',
              name: 'GOLD',
              type: 'seated',
              price: 30,
              color: '#F59E0B',
              icon: '⭐',
              width: 8,
              height: 1,
              rows: 10,
              columns: 14,
              hasAisle: true,
              aislePosition: 7,
              align: 'center'
            },
            
            // Silver Section
            {
              id: 'silver',
              name: 'SILVER',
              type: 'seated',
              price: 20,
              color: '#94A3B8',
              icon: '🪙',
              width: 8,
              height: 1,
              rows: 12,
              columns: 16,
              hasAisle: true,
              aislePosition: 8,
              align: 'center'
            }
          ]
        },
        
        // Right standing section (spans all 4 rows)
        {
          id: 'standing-right',
          name: 'STANDING',
          type: 'standing',
          price: 25,
          color: '#10B981',
          icon: '👤',
          width: 2,
          height: 4, // Full height of container
          align: 'right'
        }
      ]
    },
    
    // Row 6: FOH Area
    {
      id: 'foh',
      name: 'FOH AREA',
      type: 'foh',
      price: 15,
      color: '#475569',
      icon: '🎤',
      width: 12, // Full width
      height: 1, // 1 row tall
      align: 'center',
      description: 'Front of House with bar and facilities'
    }
  ]
};