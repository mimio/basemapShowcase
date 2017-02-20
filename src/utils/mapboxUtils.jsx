export const convertMapboxFeatureToGeoJSON = feature => {
  const geoJSONfeature = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: feature.geometry,
      properties: feature.properties
    }]
  };
  return geoJSONfeature;
}

export var geojsonEmpty = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: []
    }
  }]
};

import {
  findMinMaxForField
} from './geojsonUtils.jsx'
const generateStopArray = (minMax, stopCount, reverse) => {
  const difference = minMax[1] - minMax[0];
  const stepRange = Math.ceil(difference / stopCount);
  var colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];
  // var colors = ['#7fcdbb','#41b6c4','#1d91c0','#225ea8','#0c2c84']
  if (reverse) {
    colors = colors.reverse();
  }
  var steps = [];
  for (var i = 0; i < stopCount; i++) {
    const stepNum = minMax[0] + (i * stepRange)
    const color = colors[i]
    steps.push([stepNum, color])
  }
  return steps
}
const makeLegendStops = (colorStops, max) => {
  var legendStops = [];
  for (var i = 0; i < colorStops.length; i++) {
    var stop = [];
    // push the min
    stop.push(colorStops[i][0]);
    // push the max
    if (i === colorStops.length - 1) {
      stop.push(max);
    } else {
      stop.push(colorStops[i + 1][0]);
    }
    // now push the color in
    stop.push(colorStops[i][1])
    legendStops.push(stop)
  }
  return legendStops;
}
export const generateChoroplethStylers = (geojson, fields, fieldProps, stopCount) => {
  var stylers = {
    fillStyles: {},
    legendFormats: {}
  };
  fields.forEach(field => {
    const minMax = findMinMaxForField(geojson, field);
    const colorStops = generateStopArray(minMax, stopCount, fieldProps[field].reverse);

    const fillStyle = {
      property: field,
      type: 'interval',
      stops: colorStops
    }
    const legendStops = makeLegendStops(colorStops, minMax[1]);
    const legendFormat = {
      field: field,
      stops: legendStops,
      unit: fieldProps[field].unit
    }
    stylers.fillStyles[field] = fillStyle;
    stylers.legendFormats[field] = legendFormat;
  });
  return stylers;
}

export const buildPopupHTMLFromFeature = feature => {
  const props = feature.properties;
  const tableRows = Object.keys(props).reduce((acc,val, i, arr) => {
    const key = i + 1;
    // every other row is dark, and give the final row a unique classname in order to remove its border
    const rowClass = key % 2 ? 'tr-light' : 'tr-dark';
    const rowId = key === arr.length ? 'tr-final' : `tr-${key}`;
    const row = 
    (`
      <tr class=${rowClass} id=${rowId}>
        <td class='td-property'>
          <span class='span-property'>${val}</span>
        </td>
        <td class='td-value'>
          <span class='span-value'>${props[val]}</span>
        </td>
      </tr>
    `);
    acc += row;
    return acc;
  }, ``);
  
  const html = 
  (`
    <div class="selection">
      <span class="selectionTitle">${props["NAMELSAD"]}</span>
      <div class="tableContainer">
        <table>${tableRows}</table>
      </div>
    </div>
  `)
  return html;
}