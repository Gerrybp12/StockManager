// lib/colors.ts
const colors = {
  burgundimaron: "#800020",
  burgundiungu: "#660033",
  emeralblue: "#0F5A5E",
  emeralgreen: "#50C878",
  mahogani: "#3D0C02",
  dusty: "#B2996E",
  rosegold: "#DEA193", // alternatif: '#B76E79'
  mocca: "#9D7651",
  milo: "#F2E4D4", // alternatif: '#1C1712'
  denim: "#5A86AD",
  hitam: "#000000",
  putih: "#FFFFFF",
  terakota: "#C86F47",
  sage: "#A3B899",
  taro: "#B56F76",
  lilak: "#DCA1A1",
};

export default colors;

// Color utility functions
export const getColorHex = (colorKey: string): string => {
  const normalizedKey = colorKey.toLowerCase().replace(/\s+/g, '') as keyof typeof colors;
  return colors[normalizedKey] || colorKey; // fallback to original if not found
};

export const getColorDisplayName = (colorKey: string): string => {
  const colorMap: Record<string, string> = {
    burgundimaron: "Burgundi Maron",
    burgundiungu: "Burgundi Ungu",
    emeralblue: "Emeral Blue",
    emeralgreen: "Emeral Green",
    mahogani: "Mahogani",
    dusty: "Dusty",
    rosegold: "Rose Gold",
    mocca: "Mocha",
    milo: "Milo",
    denim: "Denim",
    hitam: "Black",
    putih: "White",
    terakota: "Terrakota",
    sage: "Sage",
    taro: "Taro",
    lilak: "Lilak",
  };

  const normalizedKey = colorKey.toLowerCase().replace(/\s+/g, '');
  return colorMap[normalizedKey] || colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
};

export const getAllColors = () => colors;

export const getColorOptions = () => {
  return Object.keys(colors).map(key => ({
    key,
    hex: colors[key as keyof typeof colors],
    displayName: getColorDisplayName(key)
  }));
};