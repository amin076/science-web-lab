import ReactGA from "react-ga4";

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (!measurementId) {
    console.warn("Google Analytics Measurement ID missing");
    return;
  }

  ReactGA.initialize(measurementId);

  console.log("Google Analytics initialized");
};

export const trackPageView = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};

export const trackEvent = (eventName, params = {}) => {
  ReactGA.event(eventName, params);
};
