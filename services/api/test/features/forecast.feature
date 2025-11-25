Feature: Weather advisories
  As a user
  I want day-wise advisories
  So that I can plan my next 3 days

  Scenario: Offline mode uses fallback data and emits umbrella advice when rain is predicted
    Given the service is running
    When I request a 3 day forecast for "London" in offline mode
    Then the response contains an advice "Carry umbrella" for at least one day

