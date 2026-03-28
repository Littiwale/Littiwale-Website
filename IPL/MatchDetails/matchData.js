const matches = [
  { date: "2026-03-28", games: [{ team1: "RCB", team2: "SRH" }] },
  { date: "2026-03-29", games: [{ team1: "MI", team2: "KKR" }] },
  { date: "2026-03-30", games: [{ team1: "RR", team2: "CSK" }] },
  { date: "2026-03-31", games: [{ team1: "PBKS", team2: "GT" }] },

  { date: "2026-04-01", games: [{ team1: "LSG", team2: "DC" }] },
  { date: "2026-04-02", games: [{ team1: "KKR", team2: "SRH" }] },
  { date: "2026-04-03", games: [{ team1: "CSK", team2: "PBKS" }] },

  { date: "2026-04-04", games: [
    { team1: "DC", team2: "MI" },
    { team1: "GT", team2: "RR" }
  ]},

  { date: "2026-04-05", games: [
    { team1: "SRH", team2: "LSG" },
    { team1: "RCB", team2: "CSK" }
  ]},

  { date: "2026-04-06", games: [{ team1: "KKR", team2: "PBKS" }] },
  { date: "2026-04-07", games: [{ team1: "RR", team2: "MI" }] },
  { date: "2026-04-08", games: [{ team1: "DC", team2: "GT" }] },
  { date: "2026-04-09", games: [{ team1: "KKR", team2: "LSG" }] },
  { date: "2026-04-10", games: [{ team1: "RR", team2: "RCB" }] },

  { date: "2026-04-11", games: [
    { team1: "PBKS", team2: "SRH" },
    { team1: "CSK", team2: "DC" }
  ]},

  { date: "2026-04-12", games: [
    { team1: "LSG", team2: "GT" },
    { team1: "MI", team2: "RCB" }
  ]},

  { date: "2026-04-13", games: [{ team1: "SRH", team2: "RR" }] },
  { date: "2026-04-14", games: [{ team1: "CSK", team2: "KKR" }] },
  { date: "2026-04-15", games: [{ team1: "RCB", team2: "LSG" }] },
  { date: "2026-04-16", games: [{ team1: "MI", team2: "PBKS" }] },
  { date: "2026-04-17", games: [{ team1: "GT", team2: "KKR" }] },

  { date: "2026-04-18", games: [
    { team1: "RCB", team2: "DC" },
    { team1: "SRH", team2: "CSK" }
  ]},

  { date: "2026-04-19", games: [
    { team1: "KKR", team2: "RR" },
    { team1: "PBKS", team2: "LSG" }
  ]},

  { date: "2026-04-20", games: [{ team1: "GT", team2: "MI" }] },
  { date: "2026-04-21", games: [{ team1: "SRH", team2: "DC" }] },
  { date: "2026-04-22", games: [{ team1: "LSG", team2: "RR" }] },
  { date: "2026-04-23", games: [{ team1: "MI", team2: "CSK" }] },
  { date: "2026-04-24", games: [{ team1: "RCB", team2: "GT" }] },

  { date: "2026-04-25", games: [
    { team1: "DC", team2: "PBKS" },
    { team1: "RR", team2: "SRH" }
  ]},

  { date: "2026-04-26", games: [
    { team1: "GT", team2: "CSK" },
    { team1: "LSG", team2: "KKR" }
  ]},

  { date: "2026-04-27", games: [{ team1: "DC", team2: "RCB" }] },
  { date: "2026-04-28", games: [{ team1: "PBKS", team2: "RR" }] },
  { date: "2026-04-29", games: [{ team1: "MI", team2: "SRH" }] },
  { date: "2026-04-30", games: [{ team1: "GT", team2: "RCB" }] },

  { date: "2026-05-01", games: [{ team1: "RR", team2: "DC" }] },
  { date: "2026-05-02", games: [{ team1: "CSK", team2: "MI" }] },

  { date: "2026-05-03", games: [
    { team1: "SRH", team2: "KKR" },
    { team1: "GT", team2: "PBKS" }
  ]},

  { date: "2026-05-04", games: [{ team1: "MI", team2: "LSG" }] },
  { date: "2026-05-05", games: [{ team1: "DC", team2: "CSK" }] },
  { date: "2026-05-06", games: [{ team1: "SRH", team2: "PBKS" }] },
  { date: "2026-05-07", games: [{ team1: "LSG", team2: "RCB" }] },
  { date: "2026-05-08", games: [{ team1: "DC", team2: "KKR" }] },
  { date: "2026-05-09", games: [{ team1: "RR", team2: "GT" }] },

  { date: "2026-05-10", games: [
    { team1: "CSK", team2: "LSG" },
    { team1: "RCB", team2: "MI" }
  ]},

  { date: "2026-05-11", games: [{ team1: "PBKS", team2: "DC" }] },
  { date: "2026-05-12", games: [{ team1: "GT", team2: "SRH" }] },
  { date: "2026-05-13", games: [{ team1: "RCB", team2: "KKR" }] },
  { date: "2026-05-14", games: [{ team1: "PBKS", team2: "MI" }] },
  { date: "2026-05-15", games: [{ team1: "LSG", team2: "CSK" }] },
  { date: "2026-05-16", games: [{ team1: "KKR", team2: "GT" }] },

  { date: "2026-05-17", games: [
    { team1: "PBKS", team2: "RCB" },
    { team1: "DC", team2: "RR" }
  ]},

  { date: "2026-05-18", games: [{ team1: "CSK", team2: "SRH" }] },
  { date: "2026-05-19", games: [{ team1: "RR", team2: "LSG" }] },
  { date: "2026-05-20", games: [{ team1: "KKR", team2: "MI" }] },
  { date: "2026-05-21", games: [{ team1: "CSK", team2: "GT" }] },
  { date: "2026-05-22", games: [{ team1: "SRH", team2: "RCB" }] },
  { date: "2026-05-23", games: [{ team1: "LSG", team2: "PBKS" }] },

  { date: "2026-05-24", games: [
    { team1: "MI", team2: "RR" },
    { team1: "KKR", team2: "DC" }
  ]}
];