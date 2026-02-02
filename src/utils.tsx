import { UAParser } from "ua-parser-js";

const utils = {
  isMobile: (): boolean => {
    const parser = new UAParser();
    const device = parser.getDevice();
    console.log(device);
    return device.type === "mobile";
  },
};

export default utils;
