export const gradeOptions = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
  '11th Grade', '12th Grade'
];

export const taskCategoryOptions = [
  {
    label: 'Academic',
    value: 'academic',
    color: 'blue'
  },
  {
    label: 'Home',
    value: 'home',
    color: 'green'
  },
  {
    label: 'Behavior',
    value: 'behavior',
    color: 'red'
  },
  {
    label: 'Extracurricular',
    value: 'extracurricular',
    color: 'yellow'
  },
  {
    label: 'Attendance',
    value: 'attendance',
    color: 'purple'
  },
  {
    label: 'Custom',
    value: 'custom',
    color: 'gray'
  }
];

export const taskDifficultyOptions = [
  {
    label: 'Easy',
    value: 'easy',
    color: 'green'
  },
  {
    label: 'Medium',
    value: 'medium',
    color: 'yellow'
  },
  {
    label: 'Hard',
    value: 'hard',
    color: 'red'
  },
  {
    label: 'Challenging',
    value: 'challenging',
    color: 'orange'
  }
];


export const FALLBACK_IMAGES = {
  // Geometric pattern with mountain silhouette
  landscape: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%2393c5fd'/%3E%3Cstop offset='100%25' stop-color='%23e0e7ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23sky)'/%3E%3Cpolygon points='0,200 100,120 200,160 300,100 400,140 400,300 0,300' fill='%236b7280'/%3E%3Cpolygon points='0,220 80,160 160,180 240,130 320,150 400,170 400,300 0,300' fill='%234b5563'/%3E%3Ccircle cx='320' cy='80' r='25' fill='%23fbbf24' opacity='0.8'/%3E%3C/svg%3E",

  // Modern user avatar with gradient
  avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%236366f1'/%3E%3Cstop offset='100%25' stop-color='%238b5cf6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='75' cy='75' r='75' fill='url(%23bg)'/%3E%3Ccircle cx='75' cy='60' r='25' fill='white' opacity='0.9'/%3E%3Cpath d='M75 85 Q55 85 40 110 Q40 125 75 125 Q110 125 110 110 Q95 85 75 85' fill='white' opacity='0.9'/%3E%3C/svg%3E",

  // Photo placeholder with camera icon
  photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='photoBg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f8fafc'/%3E%3Cstop offset='100%25' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23photoBg)' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='8,4'/%3E%3Cg transform='translate(200,150)'%3E%3Crect x='-35' y='-25' width='70' height='50' rx='8' fill='%2394a3b8'/%3E%3Ccircle cx='0' cy='0' r='15' fill='%2364748b'/%3E%3Ccircle cx='0' cy='0' r='10' fill='%23475569'/%3E%3Crect x='20' y='-20' width='8' height='8' rx='2' fill='%2394a3b8'/%3E%3C/g%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='14'%3EPhoto unavailable%3C/text%3E%3C/svg%3E",

  // Product box with shopping bag
  product: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cdefs%3E%3ClinearGradient id='productBg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23fef3c7'/%3E%3Cstop offset='100%25' stop-color='%23fed7aa'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23productBg)' rx='12'/%3E%3Cg transform='translate(150,150)'%3E%3Crect x='-40' y='-30' width='80' height='60' rx='4' fill='%23f97316' opacity='0.8'/%3E%3Cpath d='M-25,-30 Q-25,-40 -15,-40 L15,-40 Q25,-40 25,-30' stroke='%23ea580c' stroke-width='3' fill='none'/%3E%3Ccircle cx='-15' cy='-35' r='2' fill='%23ea580c'/%3E%3Ccircle cx='15' cy='-35' r='2' fill='%23ea580c'/%3E%3C/g%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%23c2410c' font-family='sans-serif' font-size='14' font-weight='500'%3EImage unavailable%3C/text%3E%3C/svg%3E",

  // Document/file icon
  document: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Cdefs%3E%3ClinearGradient id='docBg' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%23f1f5f9'/%3E%3Cstop offset='100%25' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M30 20 L140 20 L170 50 L170 230 L30 230 Z' fill='url(%23docBg)' stroke='%23cbd5e1' stroke-width='2'/%3E%3Cpath d='M140 20 L140 50 L170 50' fill='%23cbd5e1'/%3E%3Cline x1='50' y1='80' x2='150' y2='80' stroke='%2394a3b8' stroke-width='2'/%3E%3Cline x1='50' y1='100' x2='130' y2='100' stroke='%2394a3b8' stroke-width='2'/%3E%3Cline x1='50' y1='120' x2='140' y2='120' stroke='%2394a3b8' stroke-width='2'/%3E%3Ctext x='100' y='180' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='12'%3EFile not found%3C/text%3E%3C/svg%3E",

  // Minimalist image icon with geometric pattern
  image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23e2e8f0' stroke-width='1'/%3E%3C/pattern%3E%3ClinearGradient id='imgBg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23f8fafc'/%3E%3Cstop offset='100%25' stop-color='%23f1f5f9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23imgBg)'/%3E%3Crect width='300' height='200' fill='url(%23grid)' opacity='0.5'/%3E%3Cg transform='translate(150,100)'%3E%3Crect x='-30' y='-20' width='60' height='40' rx='4' fill='none' stroke='%2394a3b8' stroke-width='2'/%3E%3Ccircle cx='-15' cy='-8' r='6' fill='%23fbbf24'/%3E%3Cpolygon points='-25,10 -10,0 5,5 20,10 20,15 -25,15' fill='%2394a3b8'/%3E%3C/g%3E%3C/svg%3E",

  // Error state with gentle warning
  error: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cdefs%3E%3CradialGradient id='errorBg'%3E%3Cstop offset='0%25' stop-color='%23fef2f2'/%3E%3Cstop offset='100%25' stop-color='%23fee2e2'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23errorBg)' rx='12'/%3E%3Cg transform='translate(150,150)'%3E%3Ccircle cx='0' cy='0' r='40' fill='%23fca5a5' opacity='0.3'/%3E%3Cpath d='M-20,-20 L20,20 M20,-20 L-20,20' stroke='%23dc2626' stroke-width='3' stroke-linecap='round'/%3E%3C/g%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%23b91c1c' font-family='sans-serif' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E",

  // Loading placeholder with subtle animation effect
  loading: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Cdefs%3E%3ClinearGradient id='loadingBg' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%23f1f5f9'/%3E%3Cstop offset='50%25' stop-color='%23e2e8f0'/%3E%3Cstop offset='100%25' stop-color='%23f1f5f9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='200' fill='url(%23loadingBg)'/%3E%3Cg transform='translate(150,100)'%3E%3Ccircle cx='-20' cy='0' r='4' fill='%2394a3b8'%3E%3Canimate attributeName='opacity' values='0.3;1;0.3' dur='1.5s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='0' cy='0' r='4' fill='%2394a3b8'%3E%3Canimate attributeName='opacity' values='0.3;1;0.3' dur='1.5s' begin='0.3s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='20' cy='0' r='4' fill='%2394a3b8'%3E%3Canimate attributeName='opacity' values='0.3;1;0.3' dur='1.5s' begin='0.6s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/g%3E%3Ctext x='150' y='140' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='12'%3ELoading...%3C/text%3E%3C/svg%3E", 

  // Reward/achievement placeholder with trophy and sparkles
  reward: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cdefs%3E%3CradialGradient id='rewardBg' cx='50%25' cy='30%25'%3E%3Cstop offset='0%25' stop-color='%23fef3c7'/%3E%3Cstop offset='70%25' stop-color='%23fcd34d'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/radialGradient%3E%3ClinearGradient id='trophy' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23fbbf24'/%3E%3Cstop offset='100%25' stop-color='%23d97706'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23rewardBg)' rx='16'/%3E%3Cg transform='translate(150,150)'%3E%3C!-- Trophy base --%3E%3Crect x='-25' y='35' width='50' height='15' rx='3' fill='%23374151'/%3E%3Crect x='-20' y='30' width='40' height='10' rx='2' fill='%23374151'/%3E%3C!-- Trophy stem --%3E%3Crect x='-3' y='15' width='6' height='20' fill='%23374151'/%3E%3C!-- Trophy cup --%3E%3Cpath d='M-20,-30 Q-20,-45 0,-45 Q20,-45 20,-30 L15,15 L-15,15 Z' fill='url(%23trophy)'/%3E%3C!-- Trophy handles --%3E%3Cpath d='M-20,-25 Q-30,-25 -30,-15 Q-30,-5 -20,-5' stroke='%23d97706' stroke-width='3' fill='none'/%3E%3Cpath d='M20,-25 Q30,-25 30,-15 Q30,-5 20,-5' stroke='%23d97706' stroke-width='3' fill='none'/%3E%3C!-- Sparkles --%3E%3Cg fill='%23ffffff' opacity='0.8'%3E%3Cpath d='M-45,-45 L-43,-40 L-38,-42 L-43,-37 L-45,-32 L-47,-37 L-52,-42 L-47,-40 Z'/%3E%3Cpath d='M45,-35 L46,-32 L49,-33 L46,-30 L45,-27 L44,-30 L41,-33 L44,-32 Z'/%3E%3Cpath d='M-50,30 L-49,32 L-47,31 L-49,34 L-50,36 L-51,34 L-53,31 L-51,32 Z'/%3E%3Cpath d='M50,25 L51,27 L53,26 L51,29 L50,31 L49,29 L47,26 L49,27 Z'/%3E%3C/g%3E%3C!-- Shine effect --%3E%3Cpath d='M-15,-35 Q-10,-40 -5,-35 L-10,-20 Z' fill='%23fbbf24' opacity='0.6'/%3E%3C/g%3E%3Ctext x='150' y='240' text-anchor='middle' fill='%23a16207' font-family='sans-serif' font-size='14' font-weight='600'%3EReward unavailable%3C/text%3E%3C/svg%3E"
};
