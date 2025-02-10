export interface StoreTheme {
  id: string;
  name: string;
  colors: {
    text: string;
    background: string;
    accent: string;
  };
  background: any;
}

export const STORE_THEMES = [
  {
    id: "izly",
    name: "Izly by Crous",
    colors: {
      text: "#FFFFFF",
      background: "#2E174F",
      accent: "#DD1314",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Izly.png"),
  },
  {
    id: "turboself",
    name: "TurboSelf",
    colors: {
      text: "#FFFFFF",
      background: "#840016",
      accent: "#DD1314",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_Turboself.png"),
  },
  {
    id: "ARD",
    name: "Ard",
    colors: {
      text: "#FFFFFF",
      background: "#295888",
      accent: "#3DB7A5",
    },
    background: require("../../../../../assets/images/cards/Carte_Cover_ARD.png"),
  },
];