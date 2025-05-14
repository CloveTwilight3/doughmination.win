// Special dates and effects configuration
export const specialDates = [
  // System member birthdays - replace with your actual dates
  { 
    month: 0, 
    day: 15, 
    id: 'clove-birthday', 
    message: "🎂 Happy Birthday Clove! 🎂", 
    effect: 'birthday' 
  },
  { 
    month: 3, 
    day: 22, 
    id: 'ruby-birthday', 
    message: "🎂 Happy Birthday Ruby! 🎂", 
    effect: 'birthday' 
  },
  { 
    month: 7, 
    day: 8, 
    id: 'jett-birthday', 
    message: "🎂 Happy Birthday Jett! 🎂", 
    effect: 'birthday' 
  },
  
  // Seasonal effects
  { 
    month: 9, 
    day: 31, 
    id: 'halloween', 
    message: "👻 Happy Halloween! 👻", 
    effect: 'halloween', 
    duration: 1 
  },  // Halloween
  { 
    month: 11, 
    day: 25, 
    id: 'christmas', 
    message: "🎄 Merry Christmas! 🎄", 
    effect: 'christmas', 
    duration: 7 
  }, // Christmas
  { 
    month: 0, 
    day: 1, 
    id: 'new-year', 
    message: "🎆 Happy New Year! 🎆", 
    effect: 'new-year', 
    duration: 2 
  },  // New Year
  { 
    month: 5, 
    day: 1, 
    id: 'pride', 
    message: "🏳️‍🌈 Happy Pride Month! 🏳️‍🌈", 
    effect: 'pride', 
    duration: 30 
  },  // Pride Month
];