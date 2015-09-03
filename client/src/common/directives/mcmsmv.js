angular.module('idss-dashboard').directive('mcmsmv', ['$window',function ($window) {

      var d3 = window.d3;

      var x, y, xAxis, yAxis, svg, width;

      var margin = {top: 2, right: 2, bottom: 2, left: 2};

      return {
        restrict: 'E',
        scope: {
          data: "=",
          type: "="
        },
        link: function(scope, element, attrs) {

          scope.type = 'score'; // score or kpi value

          // get the window
            //var w = angular.element($window);
            // listen for the DOM ready to trigger the first render
            // w.ready(function() {
            //   console.log(w.width());
            //   width = w.width();
            //   render(scope.data);
            // });
            // // listen on changes on window
            // w.bind('resize', function () {
            //     scope.$apply();
            // });
            // // for rerender on windows resize
            // scope.getWindowWidth = function () {
            //     return w.width();
            // };
            // // listen for changes in scope on window on resize
            // scope.$watch(scope.getWindowWidth, function (newWidth, oldWidth) {
            //     if (newWidth !== oldWidth) {
            //       width = newWidth;
            //       render(scope.data);
            //     }
            // });

          function render(mcmsmvData) {

            // couldn't find a better way
            var width = $('#mcmsmv-container').width();

            if(!mcmsmvData || !width) {
              return;
            }

            element.empty();

            var data = [];
            var kpiRecordsCounter = 1;
            var numKpis;
            var getMetadata = function(kpiList) {
              var metadata = {};
              _.each(kpiList, function(kpi, i) {
                kpi.index = i + 1;
                metadata[kpi.kpiId] = kpi;
              });
              return metadata;
            };
            
            _.each(mcmsmvData.stakeholders, function(stakeholder) {
              var metadata = getMetadata(stakeholder.kpiList);
              numKpis = stakeholder.kpiList.length;
              console.log(numKpis);
                _.each(stakeholder.variants, function(variant) {
                  _.each(variant.kpiList, function(kpi) {
                    // a value needs to be set
                    var kpiValue = kpi.kpiValue || 0;
                    var excellent = metadata[kpi.kpiId].excellent;
                    var bad = metadata[kpi.kpiId].bad;
                    var score = 0;
                    var max, min;
                    
                    if((kpiValue || kpiValue === 0) && (excellent || excellent === 0) && (bad || bad === 0)) {
                      if(excellent < bad) {
                        max = bad;
                        min = excellent;
                        console.log('excellent is less');
                      } else {
                        max = excellent;
                        min = bad;
                      }
                      // kpi value could be larger/smaller than limits
                      max = Math.max(max, kpiValue);
                      min = Math.min(min, kpiValue);
                      score = (kpiValue - min) / (max - min);

                      // turn back if excellent was the smaller
                      if(excellent < bad) {
                        score = 1 - score;
                      }
                      score = Math.round(score * 10);
                      
                    }

                    var dataPost = {
                      stakeholder: stakeholder.user.name,
                      userId: stakeholder.user.id,
                      variantId: variant.variantId,
                      variantName: variant.name,
                      kpiName: metadata[kpi.kpiId].kpiName,
                      kpiAlias: metadata[kpi.kpiId].kpiId,
                      sufficient: metadata[kpi.kpiId].sufficient,
                      excellent: excellent,
                      bad: bad,
                      weight: metadata[kpi.kpiId].weight,
                      value: kpiValue,
                      score: score,
                      //disabled: kpi.disabled,
                      kpiIndex: metadata[kpi.kpiId].index,
                      unit: metadata[kpi.kpiId].unit || 'score',
                      count: kpiRecordsCounter
                    };
                    console.log(dataPost.score);
                    data.push(dataPost);
                    kpiRecordsCounter++;
                  });
                });
            });
  
            var chartHeight = numKpis > 10 ? numKpis * 30 : 300;
            console.log(numKpis);
            console.log(chartHeight);

            element.append([
              // '<div class="col-xs-12">',
              // ' <div id="calc-year-chart"></div>',
              // '</div>',
              // '<div class="col-xs-12">',
              // ' <div id="score-chart" class="compare-filter"><strong>KPI scores</strong></div>',
              // '</div>',
              '<div class="col-xs-3">',
              ' <div id="stakeholder-chart" class="compare-filter"><strong>Stakeholder filter</strong></div>',
              '</div>',
              '<div class="col-xs-3">',
              ' <div id="alternatives-chart" class="compare-filter"><strong>Alternative filter</strong></div>',
              '</div>',
              '<div class="col-xs-6">',
              ' <div id="kpi-chart" class="compare-filter"><strong>KPI filter</strong></div>',
              '</div>',
              '<div class="col-xs-12">',
              '<strong>KPI List</strong>',
              ' <table class="table table-hover kpi-table">',
                '<thead>',
                '    <tr>',
                '      <th>KPI name</th>',
                '      <th>Stakeholder</th>',
                '      <th>KPI ' + scope.type + '</th>',
                '      <th>Weight</th>',
                '      <th>Sufficient</th>',
                '      <th>Excellent</th>',
                '    </tr>',
                '</thead>',
              ' </table>',
              '</div>',
              '<div class="col-xs-12">',
              '<strong>Grouped by KPI</strong>',
              ' <table class="table table-hover kpi-group-table">',
                '<thead>',
                '    <tr>',
                '      <th>Alternative</th>',
                '      <th>Stakeholder</th>',
                '      <th>KPI ' + scope.type + '</th>',
                '      <th>Weight</th>',
                '      <th>Sufficient</th>',
                '      <th>Excellent</th>',
                '    </tr>',
                '</thead>',
              ' </table>',
              '</div>'
            ].join(''));

      //var scoreChart = dc.barChart("#score-chart");
      var kpiChart = dc.rowChart("#kpi-chart");
      var stakeholderChart = dc.pieChart("#stakeholder-chart");
      var alternativesChart = dc.pieChart("#alternatives-chart");
      var kpiTable = dc.dataTable(".kpi-table");
      var kpiGroupTable = dc.dataTable(".kpi-group-table");

      // Various formatters.
      var formatNumber = d3.format(",d"),
          formatChange = d3.format("+,d"),
          formatDate = d3.time.format("%B %d"),
          formatTime = d3.time.format("%I:%M %p"),
          dateFormat = d3.time.format("%m/%d/%Y"),
          numberFormat = d3.format(".2f"); 


      // feed it through crossfilter
      var ndx = crossfilter(data);
 
      // define group all for counting
      var all = ndx.groupAll();

      var score = ndx.dimension(function (d) {
        return d.score;
      });
      // var scoreGroup = score.group().reduceSum(function(d) {
      //   //return {value: d.value, score: d.score, weight: d.weight, name: d.kpiName};
      //   return d.weight;
      // });

      var test = score.group().reduce(
        /* callback for when data is added to the current filter results */
        function (p, v) {
            ++p.count;
            p.name = v.kpiName;
            p.weight = (p.weight + (v.weight ? v.weight : 0)) / p.count;
            p.score = (p.score + (v.score ? v.score : 0)) / p.count;
            p.value = (p.value + v.value) / p.count;
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function (p, v) {
            console.log('remove');
            return p;
        },
        /* initialize p */
        function () {
            return {
              count: 0,
              weight: 0,
              score: 0,
              value: 0
            };
        }
    );

      var weight = ndx.dimension(function (d) {
        return d.weight;
      });
      var weightGroup = weight.group();

      var kpi = ndx.dimension(function (d) {
        return d.kpiName;
      });
      var kpiGroup = kpi.group().reduceSum(function(d) {
        return d[scope.type];
      });

      var stakeholder = ndx.dimension(function (d) {
        return d.stakeholder;
      });
      var stakeholderGroup = stakeholder.group().reduceSum(function(d) {
        return d[scope.type];
      });

      var alternatives = ndx.dimension(function (d) {
        return d.variantName;
      });
      var alternativesGroup = alternatives.group().reduceSum(function(d) {
        return d[scope.type];
      });

  function truncateString(str, length) {
     return str.length > length ? str.substring(0, length - 3) + '...' : str;
  }

    //  scoreChart /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
    //     // (_optional_) define chart width, `default = 200`
    //     .width(width * 0.8)
    //     // (_optional_) define chart height, `default = 200`
    //     .height(chartHeight)
    //     // (_optional_) define chart transition duration, `default = 750`
    //     .transitionDuration(1500)
    //     .margins({top: 10, right: 50, bottom: 30, left: 40})
    //     .dimension(score)
    //     //The bubble chart expects the groups are reduced to multiple values which are used
    //     //to generate x, y, and radius for each key (bubble) in the group
    //     .group(test)
    //     // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
    //     //.colors(colorbrewer.RdYlGn[9])
    //     //(optional) define color domain to match your data domain if you want to bind data or color
    //     .colorDomain([0, 10])
    // //##### Accessors

    //     //Accessor functions are applied to each value returned by the grouping

    //     // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
    //     .colorAccessor(function (d) {
    //       console.log(d);
    //         return d.value.score;
    //     })
    //     // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
    //     .keyAccessor(function (p) {
    //         return p.value.score;
    //     })
    //     // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
    //     .valueAccessor(function (p) {
    //       console.log(p);
    //         return p.value.weight;
    //     })
    //     // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
    //     //   by default this maps linearly to [0,100]
    //     // .radiusValueAccessor(function (p) {
    //     //     return p.value.score;
    //     // })
    //     // .maxBubbleRelativeSize(0.3)
    //     .x(d3.scale.linear().domain([0, 10]))
    //     .y(d3.scale.linear().domain([0, 5]))
    //     //.r(d3.scale.linear().domain([0, 4000]))
    //     //##### Elastic Scaling

    //     //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
    //     .elasticY(true)
    //     .elasticX(true)
    //     //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
    //     //domains as the Accessors.
    //     .yAxisPadding(5)
    //     .xAxisPadding(10)
    //     // (_optional_) render horizontal grid lines, `default=false`
    //     .renderHorizontalGridLines(true)
    //     // (_optional_) render vertical grid lines, `default=false`
    //     .renderVerticalGridLines(true)
    //     // (_optional_) render an axis label below the x axis
    //     .xAxisLabel('Score')
    //     // (_optional_) render a vertical axis lable left of the y axis
    //     .yAxisLabel('Weight')
    //     //##### Labels and  Titles

    //     //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
    //     // (_optional_) whether chart should render labels, `default = true`
    //     .renderLabel(true)
    //     .label(function (p) {
    //         return p.value.name;
    //     })
    //     // (_optional_) whether chart should render titles, `default = false`
    //     .renderTitle(true)
    //     .title(function (p) {
    //         return [
    //             p.value.name
    //         ].join('\n');
    //     })
    //     //#### Customize Axes

    //     // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
    //     // so any additional method chaining applies to the axis, not the chart.
    //     .yAxis().tickFormat(function (v) {
    //         return v + '%';
    //     });

    //     console.log(scoreChart);

  kpiChart.width(width * 0.4)
    .height(chartHeight)
    //.minWidth(0)
    //.margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(kpi)
    .group(kpiGroup)
    .colors(d3.scale.category10())
    .label(function (d){
       return d.key + ' ' + Math.round(d.value * 100) / 100;
    })
    .title(function(d) {return d.key + ' ' + Math.round(d.value * 100) / 100;})
    .elasticX(true)
    .xAxis().ticks(4);
   
  stakeholderChart.width(width * 0.2)
    .height(chartHeight)
    .radius(width * 0.1)
    .innerRadius(20)
    .dimension(stakeholder)
    .group(stakeholderGroup)
    .label(function (d){
      console.log(d);
       return truncateString(d.key, 15);
    })
    .title(function(d) {
      console.log(d);
      return d.key + ' ' + Math.round(d.value * 100) / 100;
    });

  alternativesChart.width(width * 0.2)
    .height(chartHeight)
    .radius(width * 0.1)
    .innerRadius(20)
    .dimension(alternatives)
    .group(alternativesGroup)
    .label(function (d){
       return truncateString(d.key, 10);
    })
    .title(function(d) {return d.key + ' ' + Math.round(d.value * 100) / 100;});

    kpiTable
         .dimension(kpi)
         .group(function (d) {
             return d.variantName;
         })
         .size(100) 
        .columns([
            function(d) {
              return '<a href="#/kpi?variantId=' + d.variantId + '&kpiAlias=' + d.kpiAlias + '&back=compare-variants&userId=' + d.userId + '&stakeholder=' + d.stakeholder +'">' + d.kpiName + '</a>';
            },
            function(d) {
              return d.stakeholder;
            },
            function(d) {
              return d[scope.type];
            },
            function(d) {
              return d.weight;
            },
            function(d) {
              if(d.sufficient || d.sufficient === 0) {
                return d.sufficient + ' ' + d.unit;
              } else {
                return 'Not set';
              }
            },
            function(d) {
              if(d.excellent || d.excellent === 0) {
                return d.excellent + ' ' + d.unit;
              } else {
                return 'Not set';
              }
            }
        ])
        .renderlet(function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

    kpiGroupTable
         .dimension(kpi)
    //     // data table does not use crossfilter group but rather a closure
    //     // as a grouping function
         .group(function (d) {
             return d.kpiName;
         })
         .size(100) // (optional) max number of records to be shown, :default = 25
    //     // There are several ways to specify the columns; see the data-table documentation.
    //     // This code demonstrates generating the column header automatically based on the columns.
        .columns([
            function(d) {
              return '<a href="#/kpi?variantId=' + d.variantId + '&kpiAlias=' + d.kpiAlias + '&back=compare-variants&userId=' + d.userId + '&stakeholder=' + d.stakeholder +'">' + d.variantName + '</a>';
            },
            function(d) {
              return d.stakeholder;
            },
            function(d) {
              return d[scope.type];
            },
            function(d) {
              return d.weight;
            },
            function(d) {
              if(d.sufficient || d.sufficient === 0) {
                return d.sufficient + ' ' + d.unit;
              } else {
                return 'Not set';
              }
            },
            function(d) {
              if(d.excellent || d.excellent === 0) {
                return d.excellent + ' ' + d.unit;
              } else {
                return 'Not set';
              }
            }
        ])
        // (optional) sort using the given field, :default = function(d){return d;}
        // .sortBy(function (d) {
        //     return d.kpiName;
        // })
        // (optional) sort order, :default ascending
        //.order(d3.ascending)
        // (optional) custom renderlet to post-process chart using D3
        .renderlet(function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });

        dc.renderAll();
          }

          // watch for width change on parent element
          // scope.$watch('el[0].clientWidth', function(newWidth) {
          //   console.log('changed width: ' + newWidth());
          //   width = newWidth - margin.left - margin.right;
          //   return scope.render(scope.data);
          // });

          scope.$watch('data', function(newData, oldData) {
            render(scope.data);
          });

          scope.$watch('type', function(newType, oldType) {
            if(newType && newType !== oldType) {
              render(scope.data);
            }
          });

        }

      };
}]);
