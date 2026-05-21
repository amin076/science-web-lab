import Clarity from "@microsoft/clarity";

const clarityProjectId = "wub3r9y3je";

export const initClarity = () => {
  Clarity.init(clarityProjectId);

  console.log("Microsoft Clarity initialized");
};
