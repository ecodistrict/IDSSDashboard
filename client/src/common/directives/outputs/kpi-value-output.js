angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', '$timeout', function($compile, $timeout) {

/* jshint ignore:start */

        // Chart design based on the recommendations of Stephen Few. Implementation
        // based on the work of Clint Ivy, Jamie Love, and Jason Davies.
        // http://projects.instantcognition.com/protovis/bulletchart/
        d3.bullet = function() {
          var orient = "left", // TODO top & bottom
              reverse = false,
              duration = 0,
              ranges = bulletRanges,
              markers = bulletMarkers,
              measures = bulletMeasures,
              width = 0,
              height = 0,
              tickFormat = null;

          // For each small multiple…
          function bullet(g) {
            g.each(function(d, i) {

              if(typeof d.ranges[0] === 'undefined') {
                return false;
              }

              console.log(d);

                var g = d3.select(this); // WTF?

                var bad = ranges.call(this, d, i)[0];
                var excellent = ranges.call(this, d, i)[1];

                var numTicks = excellent > 100000 ? 2 : excellent > 1000 ? 4 : 10;

                // Compute the new x-scale.
                var x1 = d3.scale.linear()
                  .domain([bad, excellent])
                  .range([0, width]);

                // Retrieve the old x-scale, if this is an update.
                var x0 = this.__chart__ || d3.scale.linear()
                  .domain([0, Infinity])
                  .range(x1.range());

                // Stash the new scale.
                this.__chart__ = x1;

                // Derive width-scales from the x-scales.
                var w0 = bulletWidth(x0),
                  w1 = bulletWidth(x1);

                // Update the range rects. Only create one rect from excellent
                var range = g.selectAll("rect.range")
                  .data([excellent]);

                var getMaxWidth = function(d) {
                    return Math.abs(x1(excellent) - x1(bad));
                };

                var getWidth = function(d) {
                    return Math.abs(x1(d) - x1(bad));
                };

                var color = d3.scale.linear()
                .domain([bad, (bad+excellent)*0.5, excellent])
                .range(["red", "yellow", "green"]);


              range.enter().append("rect")
                  .attr("class", function(d, i) { return "range s" + i; })
                  .attr("width", w0)
                  .attr("height", height)
                  .attr("x", x0(0))
                .transition()
                  .duration(duration)
                  .attr("width", getMaxWidth)
                  .attr("x", x1(bad));

              range.transition()
                  .duration(duration)
                  .attr("x", x1(bad))
                  .attr("width", getMaxWidth)
                  .attr("height", height);

              if(typeof d.measures[0] !== 'undefined') {

              // Update the measure rects.
              var measure = g.selectAll("rect.measure")
                  .data(measures);

              measure.enter().append("rect")
                  .attr("class", function(d, i) { return "measure s" + i; })
                  .attr("width", w0)
                  .attr("height", height / 3)
                  .attr("fill", color)
                  .attr("x", x0(0))
                  .attr("y", height / 3)
                .transition()
                  .duration(duration)
                  .attr("width", getWidth)
                  .attr("fill", color)
                  .attr("x", x1(bad));

              measure.transition()
                  .duration(duration)
                  .attr("width", getWidth)
                  .attr("height", height / 3)
                  .attr("x", x1(bad))
                  .attr("fill", color)
                  .attr("y", height / 3);


              // Update the marker lines.
              var marker = g.selectAll("line.marker")
                  .data(markers);

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

          // left, right, top, bottom
          bullet.orient = function(x) {
            if (!arguments.length) return orient;
            orient = x;
            reverse = orient == "right" || orient == "bottom";
            return bullet;
          };

          // ranges (bad, satisfactory, good)
          bullet.ranges = function(x) {
            if (!arguments.length) return ranges;
            ranges = x;
            return bullet;
          };

          // markers (previous, goal)
          bullet.markers = function(x) {
            if (!arguments.length) return markers;
            markers = x;
            return bullet;
          };

          // measures (actual, forecast)
          bullet.measures = function(x) {
            if (!arguments.length) return measures;
            measures = x;
            return bullet;
          };

          bullet.width = function(x) {
            if (!arguments.length) return width;
            width = x;
            return bullet;
          };

          bullet.height = function(x) {
            if (!arguments.length) return height;
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

        function bulletRanges(d) {
          return d.ranges;
        }

        function bulletMarkers(d) {
          return d.markers;
        }

        function bulletMeasures(d) {
          return d.measures;
        }

        function bulletTranslate(x) {
          return function(d) {
            return "translate(" + x(d) + ",0)";
          };
        }

        function bulletWidth(x) {
          // start point
          var x0 = x(0);
          return function(d) {
            // get difference of start and x(d) to get width
            return Math.abs(x(d) - x0);
          };
        }

/* jshint ignore:end */

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var kpi = scope.kpi;

            var render = function() {

                var bad = kpi.bad, excellent = kpi.excellent, value = kpi.value;

                element.empty().attr('id', 'm-' + kpi.kpiAlias + '-aggregated-kpi');

                var margin = {top: 5, right: 50, bottom: 20, left: 120},
                    width = 960 - margin.left - margin.right,
                    height = 50 - margin.top - margin.bottom;

                var chart = d3.bullet()
                    .width(width)
                    .height(height)
                    .duration(1000)
                    .tickFormat(function(d) {
                        return d + ' ' + kpi.unit;
                    });


                var data = [{
                    title:"KPI value",
                    subtitle:value + ' ' + kpi.unit,
                    ranges:[bad, excellent],
                    measures:[value],
                    markers:[value],
                    rangeLabels:['Bad','Excellent'],
                    measureLabels:['Current Inventory'],
                    markerLabels:['Target Inventory']
                }];

                
                  var svg = d3.select(element[0]).selectAll("svg")
                      .data(data)
                    .enter().append("svg")
                      .attr("class", "bullet")
                      .attr("width", width + margin.left + margin.right)
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
              if(typeof newValue !== 'undefined') {
                render();
              }
            });

            //render();


        }
    };

}]);
