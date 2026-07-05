# AgroSense

## Business
AgroSense is an agri-tech startup that helps mid-size crop farms (50-500 acres) in
India increase yield and cut water/fertilizer waste using low-cost IoT soil sensors
and a mobile app powered by machine learning.

## Industry
Agriculture Technology (AgTech), IoT, Precision Farming

## Product
- Solar-powered soil moisture, NPK, and temperature sensors deployed across fields
- A mobile app (Android-first) that gives farmers daily irrigation and fertilizer
  recommendations in their local language
- A companion dashboard for agronomists/cooperatives to monitor many farms at once

## Features
- Real-time soil health monitoring via LoRaWAN-connected sensors
- ML-based yield prediction and irrigation scheduling
- SMS-based alerts for farmers without smartphones
- Marketplace integration to sell surplus produce directly to buyers

## Target Users
- Small-to-mid-size independent farmers
- Farming cooperatives and FPOs (Farmer Producer Organizations)
- Agri-input retailers who want to bundle sensors with fertilizer sales

## Competitors
CropIn, Fasal, Cropx — most competitors focus on large industrial farms or
require expensive hardware; AgroSense targets the underserved mid-size segment
with a low-cost hardware bill of materials (~$15/sensor).

## Business Model
B2B2C: sell hardware + subscription to cooperatives and agri-retailers, who then
provide the service to individual farmers at a subsidized rate.

## Revenue Model
- One-time hardware sale (sensors) at a small margin
- Annual SaaS subscription per acre monitored
- Commission on marketplace produce sales

## Technology
- Sensors: ESP32 + soil probes, LoRaWAN gateway per 5km radius
- Backend: Python/FastAPI, TimescaleDB for sensor time-series
- ML: scikit-learn yield/irrigation models retrained monthly per region
- Mobile: React Native app, SMS gateway for feature-phone users

## Market
Targeting 3 states in India initially (Maharashtra, Punjab, Karnataka), ~2M
mid-size farms in scope; expanding to Southeast Asia in year 2.

## Current Problems
- Sensor battery life drops sharply in extreme heat (>45°C)
- Farmer trust/adoption is slow — need in-person demos and local language support
- Cooperative sales cycles are long (3-6 months)
- Cash flow strain from upfront hardware manufacturing costs

## Missing Information
- No dedicated compliance/legal review for data privacy of farmer data yet
- No formal partnership agreements signed with fertilizer retailers yet, only LOIs

## SWOT
- Strengths: low-cost hardware, strong ML yield accuracy (record: 18% water savings)
- Weaknesses: small team (12 people), no dedicated ops/logistics function yet
- Opportunities: government subsidy schemes for precision agriculture in India
- Threats: monsoon variability, hardware supply chain reliant on single vendor

## Risk
Regulatory risk around farmer data ownership; hardware supply chain concentration;
climate risk affecting sensor durability testing timelines.

## Future Scope
- Drone-based aerial crop health imaging
- Carbon-credit monetization for farmers adopting water-saving practices
- Expansion into crop insurance partnerships using AgroSense sensor data as proof
