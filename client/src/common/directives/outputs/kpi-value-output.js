angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', '$timeout', function($compile, $timeout) {

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
              width = 0,
              height = 0,
              tickFormat = null;

          // For each small multiple…
          function bullet(g) {
            g.each(function(d, i) {

                var g = d3.select(this);
                var max = Math.max(bad, Math.max(sufficient || -Infinity, Math.max(excellent || -Infinity, value || -Infinity)));
                var min = Math.min(bad, Math.min(sufficient || Infinity, Math.min(excellent || Infinity, value || Infinity)));
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
                  console.log(measures);
                  
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
                  console.log(measures);
                  

                }
                var numTicks = max > 100000 ? 4 : max > 1000 ? 4 : 10;

                // Compute the new x-scale.
                var x1 = d3.scale.linear()
                  .domain([left, right])
                  .range([0, width]);

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
                  .attr("height", height / 3)
                  .attr("fill", color)
                  .attr("x", x0)
                  .attr("y", height / 3);

              measure.transition()
                  .duration(duration)
                  .attr("width", x1)
                  .attr("height", height / 3)
                  .attr("x", x1(left))
                  .attr("fill", color)
                  .attr("y", height / 3);


              // Update the marker lines.
              var marker = g.selectAll("line.marker")
                  .data([value]);

              marker.enter().append("line")
                  .attr("class", "marker")
                  .attr("x1", x0)
                  .attr("x2", x0)
                  .attr("y1", height / 6)
                  .attr("y2", height * 5 / 6)
                .transition()
                  .duration(duration)
                  .attr("x1", x1)
                  .attr("x2", x1);

              marker.transition()
                  .duration(duration)
                  .attr("x1", x1)
                  .attr("x2", x1)
                  .attr("y1", height / 6)
                  .attr("y2", height * 5 / 6);

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

function getBad(sufficient, excellent) {
  if(!excellent || !sufficient) {
    return 0;
  } 
  // span is a 6 out of 10
  var span = Math.abs(sufficient - excellent) * 1.5;
  if(sufficient >= excellent) {
    return sufficient + span;
  } else {
    return sufficient - span;
  }
}

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var kpi = scope.kpi;

            var render = function() {

              var width = $('#main').children('.container').width();
              if(!width || width === 0) {
                return; // skip rendering if width is zero
              }

              // measure and marker on value
              var value = kpi.value;

              // ranges
              var sufficient = kpi.sufficient, excellent = kpi.excellent; 

              if(!sufficient && !excellent && !value) {
                // even if zero to much data is missing
                return;
              }

              var bad = getBad(sufficient, excellent, value);

              var margin = {top: 15, right: 150, bottom: 15, left: 100};
              width = width - margin.left - margin.right;
              var height = 50 - margin.top - margin.bottom;

                element.empty().attr('id', 'm-' + kpi.kpiAlias + '-aggregated-kpi');

                var chart = d3.bullet()
                    .width(width - margin.left - 20)
                    .height(height)
                    .value(value)
                    .bad(bad)
                    .sufficient(sufficient)
                    .excellent(excellent)
                    .duration(1000)
                    .tickFormat(function(d) {
                        return d;
                    });

                var data = [{
                    title:"KPI value",
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
              // it needs to render to reset if undefined
                render();
            });


        }
    };

}]);
