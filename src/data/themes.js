export const THEMES = [
  {
    name: "Dawn",
    sky: ["#FFD8A8", "#FF9E7A"],
    hill: "#E48B6B",
    cloud: "rgba(255,255,255,0.55)",
  },
  {
    name: "Day",
    sky: ["#8FD9FF", "#4FB6E8"],
    hill: "#3FA8A0",
    cloud: "rgba(255,255,255,0.8)",
  },
  {
    name: "Sunset",
    sky: ["#FF9E7A", "#7A5AC9"],
    hill: "#5A4293",
    cloud: "rgba(255,220,200,0.5)",
  },
  {
    name: "Dusk",
    sky: ["#5A5AA0", "#2B2B5E"],
    hill: "#25255A",
    cloud: "rgba(230,220,255,0.35)",
  },
  {
    name: "Night",
    sky: ["#1B1F3B", "#0A0B1A"],
    hill: "#151834",
    cloud: "rgba(255,255,255,0.18)",
    stars: true,
  },
  {
    name: "Snow",
    sky: ["#D8ECFF", "#9FC9EA"],
    hill: "#EAF4FF",
    cloud: "rgba(255,255,255,0.9)",
  },
  {
    name: "Forest",
    sky: ["#BFE6B0", "#6FBF73"],
    hill: "#3E8E52",
    cloud: "rgba(255,255,255,0.6)",
  },
  {
    name: "Desert",
    sky: ["#FFE3A3", "#F2B36B"],
    hill: "#D98E4B",
    cloud: "rgba(255,255,255,0.4)",
  },
  {
    name: "Ocean",
    sky: ["#8FE3E0", "#2C93B5"],
    hill: "#1E7089",
    cloud: "rgba(255,255,255,0.6)",
  },
  {
    name: "Space",
    sky: ["#2B1B4E", "#0A0620"],
    hill: "#1B1240",
    cloud: "rgba(180,150,255,0.25)",
    stars: true,
  },
];

export function themeForLevel(level) {
  return THEMES[Math.floor((level - 1) / 3) % THEMES.length];
}
