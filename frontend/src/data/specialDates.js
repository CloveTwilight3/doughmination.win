// Special dates and effects configuration
export const specialDates = [
  // System member birthdays - replace with your actual dates
  // 0 - Jan and 11 - Dec
  { 
    month: 8, 
    day: 15, 
    id: 'clove-birthday', 
    message: "🎂 Happy Birthday Clove! 🎂", 
    effect: 'birthday' 
  },
  {
    month: 6,
    day: 4,
    id: 'spectra-birthday',
    message: "🎂 Happy Birthday Spectra! 🎂",
    effect: 'birthday',
  },
  {
    month: 4,
    day: 14,
    id: "sage-birthday",
    message: "🎂 Happy Birthday Sage! 🎂",
    effect: 'birthday'
  },
  {
    month: 5,
    day: 14,
    id: "daisy-birthday",
    message: "🎂 Happy Birthday Daisy! 🎂",
    effect: 'birthday'
  },
  { 
    month: 2, 
    day: 22, 
    id: 'ruby-birthday', 
    message: "🎂 Happy Birthday Ruby! 🎂", 
    effect: 'birthday'
  },
  { 
    month: 6, 
    day: 8, 
    id: 'jett-birthday', 
    message: "🎂 Happy Birthday Jett! 🎂", 
    effect: 'birthday'
  },
  {
    month: 4,
    day: 6,
    id: 'emilylinkin-birthday',
    message: "🎂 Happy Birthday Emily! 🎂",
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