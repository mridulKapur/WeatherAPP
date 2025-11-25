const C_TO_SUNSCREEN = 40;
const WIND_MPH_THRESHOLD = 10;

export function defaultAdvisoryRules() {
  return [
    {
      id: "rain-umbrella",
      when: (facts) => facts.hasRain,
      message: "Carry umbrella"
    },
    {
      id: "heat-sunscreen",
      when: (facts) => facts.highC > C_TO_SUNSCREEN,
      message: "Use sunscreen lotion"
    },
    {
      id: "wind-warning",
      when: (facts) => facts.maxWindMph > WIND_MPH_THRESHOLD,
      message: "It’s too windy, watch out!"
    },
    {
      id: "thunderstorm-danger",
      when: (facts) => facts.hasThunderstorm,
      message: "Don’t step out! A Storm is brewing!"
    }
  ];
}

