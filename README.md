
# [ma-services](https://goinvo.github.io/ma-services/): Data visualization for MA Services.
ma-services is a data visualization to show all Massachusetts services with their sizes, government spending, and eligibility criteria. 
ma-services is built using HTML, CSS, JS and [D3](https://d3js.org/).

![ma-services](ma-services.png)
![ma-services](https://github.com/ma-services/ma-services.png)


Two views: Tree map and table
Two Filters: All services and benefits 
             Smaller sized (by # people) services are seperated

## Demos
[React Demo](https://hgraph-os.github.io/hGraph/)  
[Patient Demo](https://www.hgraph.org/demo/)  
[Hospital Demo](http://hospital.hgraph.org)

## Installation
This package can be [found on npm](https://www.npmjs.com/package/hgraph-react) and installed like so:
```bash
$ yarn add hgraph-react
# or
$ npm install hgraph-react
```
The hGraph component is packaged using [webpack](https://webpack.js.org/). 

## Usage

### hGraph Component Props
Most props are not required and have sensible defaults built in, as listed below.

| Prop Name | Type | Is Required | Description | Default |
| --------- | ---- | ----------- | ----------- | ------- |
| data | array | true | An array of objects representing the metrics to display in hGraph (see [below](#metrics)) | N/A |
| score | number | false | The overall score (hScore) to display in the center of hGraph | N/A |
| width | number | false | The width in pixels hGraph should render at. | 600 |
| height | number | false | The height in pixels hGraph should render at. | 600 |
| margin | object | false | An object representing the values for margins around hGraph. | `{ top: 70, right: 100, bottom: 70, left: 100 }` |
| thresholdMin | number | false | A number value between 0 and 1 (percentage), determining the position the lower threshold of the healthy range renders at. | .25 |
| thresholdMax | number | false | A number value between 0 and 1 (percentage), determining the position the upper threshold of the healthy range renders at. | .75 |
| donutHoleFactor | number | false | A number value between 0 and 1 (percentage), determining the amount of hGraph's radius that should be cut out forming the hole in the center of the graph. | .4 |
| color | string (hex color code) | false | The color of the points and polygon shape. | '#616363' |
| healthyRangeFillColor | string (hex color code) | false | The color of the healthy range band. | '#98bd8e' |
| fontSize | number | false | The size (in pixels) of the font for the labels. | 16 |
| fontColor | string (hex color code) | false | The color of the labels. | '#000' |
| showAxisLabel | boolean | false | Whether or not axis labels should display around hGraph. | true |
| axisLabelWrapWidth | number | false | The width (in pixels) that the labels should wrap text at. | 80 (Note: use `null` for no wrapping) |
| axisLabelOffset | number | false | The distance (in pixels) that axis labels should be offset from the outer bounds of hGraph's 'absolute max' radius. | 12 |
| areaOpacity | number | false | The opacity of the polygon shape. | 0.25 |
| pointRadius | number | false | The radius (in pixels) of the points for metric values. | 10 |
| pointLabelWrapWidth | number | false | The width (in pixels) that the point labels should wrap text at. | null (no wrapping) |
| pointLabelOffset | number | false | The distance (in pixels) that point labels should be offset from the point. | 8 |
| hitboxRadius | number | false | The radius (in pixels) of the point hitboxes. (hGraph overlays a transparent hitbox over each point which can help users accurately click/touch points, particularly on mobile devices.) | Defaults to `props.pointRadius` size. |
| showScore | boolean | false | Whether or not to display the overall score (hScore) in the middle of hGraph. | true |
| scoreFontSize | number | false | The size (in pixels) of the font for the overall hGraph score | 120 |
| scoreFontColor | string (hex color code) | false | The color of the hGraph score. | '#000' |
| zoomFactor | number | false | The multiplier factor hGraph should zoom in. | 2.25 |
| zoomTransitionTime | number | false | The amount of time (in milliseconds) the zooming animation should take. | 750 |
| zoomOnPointClick | boolean | false | Configure if hGraph should zoom in/focus on a clicked point and display child points in the graph. | true |
| onPointClick | function | false | Callback function called when a point is clicked. Function is passed 2 arguments: the data object corresponding to the point clicked, and the event. | N/A |

### hGraph Metric Object Properties <a name="metrics"></a>
| Property Name | Type | Is Required | Description |
| ------------- | ---- | ----------- | ----------- |
| id | string | true | A unique (compared to all other metrics) identifier string for the metric. |
| label | string | true | The axis display label for the metric. |
| value | number | true | The patient's recorded value for the metric. |
| healthyMin | number | true | The minimum value possible to still be considered a healthy value. |
| healthyMax | number | true | The maximum value possible to still be considered a healthy value. |
| absoluteMin | number | true | A reasonable minimum possible value for this metric. Note: values below this absolute minimum will be clamped to the min.) |
| absoluteMax | number | true | A reasonable maximum possible value for this metric. Note: values above this absolute maximum will be clamped to the max. |
| unitLabel | string | true | The units the metric is measured in, displayed with the metric value. |
| children | array | false | Optional array of child metrics that comprise this metric. Children metrics should conform to hGraph Metric Objects properties. Children are shown when a point is clicked and hGraph is in the "zoomed in" state. |

### hMetrics
Set of health metrics to be displayed on the hGraph. A default set is provided but can be tailored to your installation.  
![hMetrics Component](https://github.com/hgraph-os/hgraph-design/blob/main/hGraph-components-diagram/hgraph-components-hmetrics.png)

(steps to edit coming)

### hRanges
Defines the healthy range for hMetrics. A default set is provided but should be tailored to your installation.  
![hRanges Component](https://github.com/hgraph-os/hgraph-design/blob/main/hGraph-components-diagram/hgraph-components-hranges.png)

(steps to edit coming)

### [hScore](https://github.com/hgraph-os/hScore) (notional)
hScore is an algorithm for scoring a person's health and can be displayed at the center of the hGraph. hScore is currently a concept and has not been developed.  
![hScore Component](https://github.com/hgraph-os/hgraph-design/blob/main/hGraph-components-diagram/hgraph-components-hscore.png)

### Synthetic Patient Data
For development and demo’s, we’ve used [Synthea](https://synthetichealth.github.io/synthea/) for generating synthetic patient data to display in hGraph.

(steps to include coming)

## Notable Repos
* A [React Native port](https://github.com/CitizenHealth/react-native-hgraph) is available from Citizen Health.
* hGraph on FHIR (Fast Healthcare Interoperability Resources): [https://github.com/symptomatic/hgraph-on-fhir](https://github.com/symptomatic/hgraph-on-fhir)
* hGraph + Spider chart [demo](https://goinvo.github.io/VisualizationComponents/), [repo](https://github.com/goinvo/VisualizationComponents)

## Project

### [Roadmap](https://docs.google.com/document/d/1IiRXmd64ZKRt3mrrDPn4E2GWY5KBm_4VFHAtwOndPZA/)

### [Code of Conduct](https://github.com/hgraph-os/hGraph/blob/master/CODE_OF_CONDUCT.md)
hGraph has adopted a Code of Conduct that we expect project participants to adhere to.  
Please read the [full text](https://github.com/hgraph-os/hGraph/blob/master/CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

### [Contributing Guidelines](https://github.com/hgraph-os/hGraph/blob/master/CONTRIBUTE.md)
We encourage you to contribute to hGraph!  
See the [contributing guidelines](https://github.com/hgraph-os/hGraph/blob/master/CONTRIBUTE.md) for how to proceed.

### Core Contributors
Founders/Designers: [GoInvo](http://www.goinvo.com) is a digital design studio in Boston, crafting the future of healthcare through strategy, creativity, and vision.

### Contact Us
[hgraph@goinvo.com](mailto:hgraph@goinvo.com)  
[Open Office Hours](https://calendly.com/goinvo/hgraph-open-office-hours)

### License
hGraph is [Apache 2.0](https://github.com/goinvo/hGraph/blob/master/LICENSE) licensed.

### For guidance integrating hGraph into your product or service, contact us at [hgraph@goinvo.com](mailto:hgraph@goinvo.com).