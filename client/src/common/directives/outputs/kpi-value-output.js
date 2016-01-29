angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', '$timeout', 'KpiService', function($compile, $timeout, KpiService) {

  // add some decimal rounding from mozilla.
  // TODO: consider removing this from here, it's extending Math library...
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round

  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }

/* jshint ignore:start */

        // Chart design based on the recommendations of Stephen Few. Implementation
        // based on the work of Clint Ivy, Jamie Love, and Jason Davies.
        // http://projects.instantcognition.com/protovis/bulletchart/
        d3.bullet = function() {
          var duration = 0,
              bad,
              sufficient,
              excellent,
              value,
              asIsValue,
              width = 0,
              height = 0,
              tickFormat = null;

          // For each small multiple…
          function bullet(g) {
            g.each(function(d, i) {

                var g = d3.select(this);
                var max = KpiService.getMax(bad, sufficient, excellent, value); 
                var min = KpiService.getMin(bad, sufficient, excellent, value); 
                var left, right, measures = [];
                if(excellent < sufficient) {
                  left = max;
                  right = min;
                  measures.push(min);
                  if(excellent || excellent === 0) {
                    measures.push(excellent)
                  }
                  if(sufficient || sufficient === 0) {
                    measures.push(sufficient)
                  }
                  measures.push(max);
                  measures = _.uniq(measures, true);
                  
                } else {

                  left = min;
                  right = max;
                  measures.push(max);
                  if(excellent || excellent === 0) {
                    measures.push(excellent)
                  }
                  if(sufficient || sufficient === 0) {
                    measures.push(sufficient)
                  }
                  measures.push(min);
                  measures = _.uniq(measures, true);
                  

                }
                var numTicks = max > 100000 ? 4 : max > 1000 ? 4 : 10;

                // Compute the new x-scale.
                var x1 = d3.scale.linear()
                  .domain([left, right])
                  .range([0, width]);

                // use .clamp() to keep value inside of scale range (right now this is taken care of above when determine min and max)

                // Retrieve the old x-scale, if this is an update.
                var x0 = this.__chart__ || d3.scale.linear()
                  .domain([0, Infinity])
                  .range(x1.range());

                // Stash the new scale.
                this.__chart__ = x1;

                // Derive width-scales from the x-scales.
                var w1 = function() {
                  // start point
                  var start = x1(0);
                  return function(d) {
                    // get difference of start and x(d) to get width
                    return Math.abs(x1(d) - start);
                  };
                };

                var getMaxWidth = function(d) {
                  console.log(Math.abs(x1(right) - x1(left)));
                    return Math.abs(x1(right) - x1(left));
                };

                var getWidth = function(d) {
                    return Math.abs(x1(d) - x1(right));
                };

                var color = d3.scale.linear()
                .domain([left, (left+right)*0.5, right])
                .range(["red", "yellow", "green"]);

              // Update the range rects
              var range = g.selectAll("rect.range")
                  .data(measures);

              range.enter().append("rect")
                  .attr("class", function(d, i) { return "range s" + i; })
                  .attr("width", 0);
                
              range.transition()
                  .duration(duration)
                  .attr("x", x1(left))
                  .attr("width", x1)
                  .attr("height", height);

             if(typeof value !== 'undefined') {

              // Update the measure rects.
              var measure = g.selectAll("rect.measure")
                  .data([value]);

              measure.enter().append("rect")
                  .attr("class", function(d, i) { return "measure s" + i; })
                  .attr("width", x0)
                  .attr("height", height / 8 * 3)
                  .attr("fill", color)
                  .attr("x", x0)
                  .attr("y", height / 8 * 2);

              measure.transition()
                  .duration(duration)
                  .attr("width", x1)
                  .attr("height", height / 8 * 3)
                  .attr("x", x1(left))
                  .attr("fill", color)
                  .attr("y", height / 8* 2);


              // Update the marker lines.
              // var marker = g.selectAll("line.marker")
              //     .data([value]);

              // marker.enter().append("line")
              //     .attr("class", "marker")
              //     .attr("x1", x0)
              //     .attr("x2", x0)
              //     .attr("y1", height / 8 * 2)
              //     .attr("y2", height / 8 * 5)
              //   .transition()
              //     .duration(duration)
              //     .attr("x1", x1)
              //     .attr("x2", x1);

              // marker.transition()
              //     .duration(duration)
              //     .attr("x1", x1)
              //     .attr("x2", x1)
              //     .attr("y1", height / 8 * 2)
              //     .attr("y2", height / 8 * 5);

              }

              if(asIsValue || asIsValue === 0) {

                // Update the measure rects.
              var measure = g.selectAll("rect.measure-as-is")
                  .data([asIsValue]);

              measure.enter().append("rect")
                  .attr("class", function(d, i) { return "measure s" + i; })
                  .attr("width", x0)
                  .attr("height", height / 8)
                  .attr("fill", "#777")
                  .attr("x", x0)
                  .attr("y", height / 8 * 5);

              measure.transition()
                  .duration(duration)
                  .attr("width", x1)
                  .attr("height", height / 8)
                  .attr("x", x1(left))
                  .attr("fill", "#777")
                  .attr("y", height / 8 * 5);

                var markerAsIs = g.selectAll("line.marker-as-is")
                  .data([asIsValue]);

                // markerAsIs.enter().append("line")
                //     .attr("class", "marker-as-is")
                //     .attr("x1", x0)
                //     .attr("x2", x0)
                //     .attr("y1", height / 8 * 5)
                //     .attr("y2", height)
                //   .transition()
                //     .duration(duration)
                //     .attr("x1", x1)
                //     .attr("x2", x1);

                // markerAsIs.transition()
                //     .duration(duration)
                //     .attr("x1", x1)
                //     .attr("x2", x1)
                //     .attr("y1", height / 8 * 5)
                //     .attr("y2", height);

              }


              // Update the tick groups.
              var tick = g.selectAll("g.tick")
                  .data(x1.ticks(numTicks), function(d) {
                    return tickFormat(d);
                  });

              // Initialize the ticks with the old scale, x0.
              var tickEnter = tick.enter().append("g")
                  .attr("class", "tick")
                  .attr("transform", bulletTranslate(x0))
                  .style("opacity", 1e-6);

              tickEnter.append("line")
                  .attr("y1", height)
                  .attr("y2", height * 7 / 6);

              tickEnter.append("text")
                  .attr("text-anchor", "middle")
                  .attr("dy", "1em")
                  .attr("y", height * 7 / 6)
                  .text(tickFormat);

              // Transition the entering ticks to the new scale, x1.
              tickEnter.transition()
                  .duration(duration)
                  .attr("transform", bulletTranslate(x1))
                  .style("opacity", 1);

              // Transition the updating ticks to the new scale, x1.
              var tickUpdate = tick.transition()
                  .duration(duration)
                  .attr("transform", bulletTranslate(x1))
                  .style("opacity", 1);

              tickUpdate.select("line")
                  .attr("y1", height)
                  .attr("y2", height * 7 / 6);

              tickUpdate.select("text")
                  .attr("y", height * 7 / 6);

              // Transition the exiting ticks to the new scale, x1.
              tick.exit().transition()
                  .duration(duration)
                  .attr("transform", bulletTranslate(x1))
                  .style("opacity", 1e-6)
                  .remove();
            });
            d3.timer.flush();
          }

          bullet.bad = function(x) {
            bad = x;
            return bullet;
          };

          bullet.sufficient = function(x) {
            sufficient = x;
            return bullet;
          };

          bullet.excellent = function(x) {
            excellent = x;
            return bullet;
          };

          bullet.value = function(x) {
            value = x;
            return bullet;
          };

          bullet.asIs = function(x) {
            asIsValue = x;
            return bullet;
          };

          bullet.width = function(x) {
            width = x;
            return bullet;
          };

          bullet.height = function(x) {
            height = x;
            return bullet;
          };

          bullet.tickFormat = function(x) {
            if (!arguments.length) return tickFormat;
            tickFormat = x;
            return bullet;
          };

          bullet.duration = function(x) {
            if (!arguments.length) return duration;
            duration = x;
            return bullet;
          };

          return bullet;
        };

        function bulletTranslate(x) {
          return function(d) {
            return "translate(" + x(d) + ",0)";
          };
        }

/* jshint ignore:end */

    return {
        restrict: 'E',
        scope: {
            kpi: '=',
            showAmbition: '@'
        },
        link: function ( scope, element, attrs ) {

            var kpi = scope.kpi;

            var render = function() {

              var width = $('#main').children('.container').width();
              if(!width || width === 0) {
                return; // skip rendering if width is zero
              }

              // measure and marker on value
              var value = scope.showAmbition ? kpi.ambition : kpi.value;
              var asIsValue = scope.showAmbition ? kpi.value : null;

              console.log(kpi);
              console.log(value);

              // ranges
              var sufficient = kpi.sufficient, excellent = kpi.excellent; 

              if(!sufficient && !excellent && !value) {
                // even if zero to much data is missing
                return;
              }

              var bad = KpiService.getBad(sufficient, excellent, value);

              var margin = {top: 15, right: 150, bottom: 15, left: 100};
              width = width - margin.left - margin.right;
              var height = 50 - margin.top - margin.bottom;

                element.empty().attr('id', 'm-' + kpi.kpiAlias + '-aggregated-kpi');

                var chart = d3.bullet()
                    .width(width - margin.left - 20)
                    .height(height)
                    .value(value)
                    .asIs(asIsValue)
                    .bad(bad)
                    .sufficient(sufficient)
                    .excellent(excellent)
                    .duration(1000)
                    .tickFormat(function(d) {
                        var decimals = d.toString().split('.')[1];
                        if(decimals) {
                          console.log(decimals);
                          console.log(decimals.length);
                          if(decimals.length > 3) {
                            d = Math.round10(d, -3);
                            console.log(d);
                          }
                        }
                        return d;
                    });

                var data = [{
                    title:"KPI values",
                    rangeLabels:['Bad','Excellent'],
                    measureLabels:['Current Inventory'],
                    markerLabels:['Target Inventory']
                }];

                data[0].subtitle = value || value === 0 ? value + ' ' + kpi.unit : 'No value is set';

                  var svg = d3.select(element[0]).selectAll("svg")
                      .data(data)
                    .enter().append("svg")
                      .attr("class", "bullet")
                      .attr("width", width)
                      .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                      .call(chart);

                  var title = svg.append("g")
                      .style("text-anchor", "end")
                      .attr("transform", "translate(-6," + height / 2 + ")");

                  title.append("text")
                      .attr("class", "title")
                      .text(function(d) { return d.title; });

                  title.append("text")
                      .attr("class", "subtitle")
                      .attr("dy", "1em")
                      .text(function(d) { return d.subtitle; });

            };

            scope.$watch('kpi.value', function(newValue, oldValue) {
              if(newValue !== oldValue || typeof newValue === 'undefined') {
                render();
              }
            });

            console.log(scope.showAmbition);

            if(scope.showAmbition) {

              scope.$watch('kpi.ambition', function(newValue, oldValue) {
                console.log(newValue, oldValue);
                if(newValue !== oldValue || typeof newValue === 'undefined') {
                  render();
                }
              });

            }


        }
    };

}]);
