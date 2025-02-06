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
];