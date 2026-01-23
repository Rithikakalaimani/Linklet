import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// Register locale for country name translation
countries.registerLocale(enLocale);

// GeoJSON URL
const GEO_URL = "/world-countries.json";

const LocationMap = ({ data }) => {
  // Data is { "US": 10, "IN": 5, ... } (ISO Alpha-2)

  // Convert data to ISO Alpha-3 for the map
  const mapData = useMemo(() => {
    const converted = {};
    if (!data) return converted;

    Object.entries(data).forEach(([code, count]) => {
      // Convert 2-letter to 3-letter
      const alpha3 = countries.alpha2ToAlpha3(code);
      if (alpha3) {
        converted[alpha3] = count;
      }
    });
    return converted;
  }, [data]);

  const maxValue = Math.max(...Object.values(mapData), 0);

  const colorScale = scaleLinear()
    .domain([0, maxValue || 1])
    .range(["#dbeafe", "#1e40af"]); // Light blue to Dark blue

  return (
    <div className="bg-gray-900 p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-800 h-full flex flex-col">
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-100 mb-2 sm:mb-3 lg:mb-4">Clicks by Location</h3>
      <div className="flex-grow min-h-0 relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <ComposableMap 
          projection="geoMercator" 
          projectionConfig={{ scale: 50 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%", maxHeight: "100%" }}
        >
          <ZoomableGroup center={[0, 0]} zoom={0.8}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode = geo.id; // ISO Alpha-3
                  const count = mapData[countryCode] || 0;
                  const countryName = geo.properties.name;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={count > 0 ? colorScale(count) : "#374151"}
                      stroke="#4b5563"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { 
                          fill: count > 0 ? "#3b82f6" : "#4b5563", 
                          outline: "none",
                          cursor: "pointer"
                        },
                        pressed: { outline: "none" },
                      }}
                      data-tooltip-id="map-tooltip"
                      data-tooltip-content={`${countryName}: ${count} clicks`}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <Tooltip id="map-tooltip" />
      </div>
      

    </div>
  );
};

export default LocationMap;
