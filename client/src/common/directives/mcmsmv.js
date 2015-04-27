angular.module('idss-dashboard').directive('mcmsmv', [function () {

      var d3 = window.d3;

      var x, y, xAxis, yAxis, svg, width = 900, height = 400;

      var margin = {top: 2, right: 2, bottom: 2, left: 2};

      return {
        restrict: 'E',
        scope: {
          data: "="
        },
        link: function(scope, element, attrs) {

          scope.render = function(mcmsmvData) {

            console.log(mcmsmvData);

            if(!mcmsmvData) {
              return;
            }

            element.empty();

            var data = [];
            var kpiCounter = 1;
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
                _.each(stakeholder.variants, function(variant) {
                  _.each(variant.kpiList, function(kpi) {
                    data.push({
                      stakeholder: stakeholder.user.name,
                      variantId: variant.variantId,
                      variantName: variant.name,
                      kpiName: metadata[kpi.kpiId].kpiName,
                      bad: metadata[kpi.kpiId].bad,
                      excellent: metadata[kpi.kpiId].excellent,
                      value: kpi.kpiValue,
                      kpiIndex: metadata[kpi.kpiId].index,
                      unit: metadata[kpi.kpiId].unit,
                      count: kpiCounter
                    });
                    kpiCounter++;
                  });
                });
            });

            console.log(data);
            
            element.append([
              // '<div class="col-xs-12">',
              // ' <div id="calc-year-chart"></div>',
              // '</div>',
              '<div class="col-xs-6">',
              ' <div id="alternatives-chart"><strong>Alternatives</strong></div>',
              '</div>',
              '<div class="col-xs-6">',
              ' <div id="kpi-chart"><strong>KPIs</strong></div>',
              '</div>',
              '<div class="col-xs-12">',
              '<strong>KPI List</strong>',
              ' <table class="table table-hover kpi-table">',
                '<thead>',
                '    <tr>',
                '      <th>KPI name</th>',
                '      <th>KPI value</th>',
                '      <th>Bad</th>',
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
                '      <th>KPI value</th>',
                '      <th>Bad</th>',
                '      <th>Excellent</th>',
                '    </tr>',
                '</thead>',
              ' </table>',
              '</div>'
            ].join(''));

      //var yearChart = dc.barChart("#calc-year-chart");
      var kpiChart = dc.rowChart("#kpi-chart");
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

      // define a dimension
      // var byWeek = ndx.dimension(function(d) { return d.count; });
      // var weekGroup = byWeek.group().reduceSum(function(d) {
      //   return d.value;
      // });

      var kpi = ndx.dimension(function (d) {
        return d.kpiName;
      });
      var kpiGroup = kpi.group().reduceSum(function(d) {
        return d.value;
      });

      // var calculation = ndx.dimension(function (d) {
      //     return d.name;
      // });
      // var calculationGroup = calculation.group();

      var alternatives = ndx.dimension(function (d) {
        return d.variantName;
      });
      var alternativesGroup = alternatives.group().reduceSum(function(d) {
        return d.value;
      });

      // var calculationByWeekGroup = byWeek.group();

      // var calculationByDay = ndx.dimension(function(d) { return d3.time.day(d.date); });
      // var calculationByDayGroup = calculationByDay.group();

      // var calculationByProperty = ndx.dimension(function(d) { return d.type; });
      // var calculationByPropertyGroup = calculationByProperty.group().reduceSum(function(d) {
      //   return d.value;
      // });

      // var calculationGroups = [];

      // _.each(calculationNames, function(calculationName) {
      //   var group = calculationByDay.group().reduceSum(function(d) {
      //     if(d.name === calculationName) {
      //       return d.value; 
      //     } else {
      //       return false;
      //     }
      //   });
      //   var chart = dc.lineChart(weekChart)
      //       .group(group)
      //       .elasticY(true)
      //       .yAxisPadding(0)
      //       .elasticX(true)
      //       .renderArea(true)
      //       .round(d3.time.hour.round)
      //       .xUnits(d3.time.days)
      //       .renderHorizontalGridLines(true)
      //       .renderVerticalGridLines(true)
      //       .brushOn(false)
      //       .title(function (d) {
      //           return formatDate(d.x) + '\n' + d.y + ' kWh';
      //       });

      //   calculationGroups.push(chart);
      // });

      // this draws every property in dataPosts in linechart
      // _.each(dataPosts, function(post) {
      //   var group = calculationByDay.group().reduceSum(function(d) {
      //     if(d.type === post) {
      //       return d.value; 
      //     } else {
      //       return false;
      //     }
      //   });
      //   var chart = dc.lineChart(weekChart)
      //       .group(group)
      //       .elasticY(true)
      //       .yAxisPadding(0)
      //       .elasticX(true)
      //       .renderArea(true)
      //       .round(d3.time.hour.round)
      //       .xUnits(d3.time.days)
      //       .renderHorizontalGridLines(true)
      //       .renderVerticalGridLines(true)
      //       .brushOn(false);
      //   calculationGroups.push(chart);
      // });

        // weekChart
        //   .dimension(calculationByDay)
        //   .group(calculationByDayGroup)
        //   .elasticY(true)
        //   .width(null) // (optional) define chart width, :default = 200
        //   .height(null) // (optional) define chart height, :default = 200
        //   .margins({top: 10, right: 20, bottom: 20, left: 40})
        //   .transitionDuration(500) // (optional) define chart transition duration, :default = 500
        //   .compose(calculationGroups)
        //   .renderHorizontalGridLines(true)
        //   .brushOn(false)
        //   .x(d3.time.scale().domain([new Date(2001, 0, 1), new Date(2001, 11, 31)]))
        //   .xAxis();

        // yearChart.width(990)
        // .height(100)
        // .margins({top: 0, right: 50, bottom: 20, left: 40})
        // .dimension(byWeek)
        // .group(weekGroup)
        // .centerBar(true)
        // .gap(1)
        // .x(d3.scale.linear().domain([0, 10]));
        //.alwaysUseRounding(true);
        //.xUnits(d3.time.months);
          
     
    //   yearChart
    //       .width(300) // (optional) define chart width, :default = 200
    //       .height(64) // (optional) define chart height, :default = 200
    //       .transitionDuration(500) // (optional) define chart transition duration, :default = 500
    //       // (optional) define margins
    //       .margins({top: 10, right: 20, bottom: 20, left: 40})
    //       .dimension(byWeek) // set dimension
    //       .group(weekGroup) // set group
    //       // .title(function(d){return d.value;})
    //       // .label(function (d, i){
    //       //    return i + 1;
    //       // })
    //       // (optional) whether chart should rescale y axis to fit data, :default = false
    //       .elasticY(false)
    //       // (optional) when elasticY is on whether padding should be applied to y axis domain, :default=0
    //       .yAxisPadding(0)
    //       // (optional) whether chart should rescale x axis to fit data, :default = false
    //       .elasticX(true)
    //       // (optional) when elasticX is on whether padding should be applied to x axis domain, :default=0
    //       //.xAxisPadding(500)
    //       // define x scale
    //       .x(d3.scale.linear().domain([1, 10]))
    //       // (optional) set filter brush rounding
    //       //.round(d3.time.weeks.round)
    //       // define x axis units
    //       //.xUnits()
    //       // (optional) whether bar should be center to its x value, :default=false
    //       .centerBar(true)
    //       // (optional) set gap between bars manually in px, :default=2
    //       //.barGap(1)
    //       // (optional) render horizontal grid lines, :default=false
    //       .renderHorizontalGridLines(true)
    //       // (optional) render vertical grid lines, :default=false
    //       .renderVerticalGridLines(true)
    //       // (optional) add stacked group and custom value retriever
    //       //.stack(monthlyMoveGroup, function(d){return d.value;})
    //       // (optional) you can add multiple stacked group with or without custom value retriever
    //       // if no custom retriever provided base chart's value retriever will be used
    //       //.stack(monthlyMoveGroup)
    //       // (optional) whether this chart should generate user interactive brush to allow range
    //       // selection, :default=true.
    //       //.brushOn(true)
    //       /*.renderlet(function(chart){
    //           chart.select("g.y").style("display", "none");
    //           weekChart.filter(chart.filter());
    //       });*/
    // .colors(d3.scale.category10())
    //       .yAxis().ticks(3);
          // (optional) whether svg title element(tooltip) should be generated for each bar using
          // the given function, :default=no
          //.title(function(d) { return "Value: " + d.value; })
          // (optional) whether chart should render titles, :default = false
          //.renderTitle(true);

          // row chart day of week

  // yearChart.on('.renderlet(', function(chart){
  //             dc.events.trigger(function(){
  //                 weekChart.focus(chart.filter());
  //             });
  // });

  kpiChart.width(200)
    .height(100)
    //.minWidth(0)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(kpi)
    .group(kpiGroup)
    .colors(d3.scale.category10())
    .label(function (d){
      console.log(d);
       return d.key + ' ' + d.value;
    })
    // .title(function(d) {return d.kpiName;})
    .elasticX(true)
    .xAxis().ticks(4);

   

  //   calcSelectChart.width(null)
  //   .height(null)
  //   .radius(null)
  //   .minWidth(0)
  //   .minHeight(0)
  //   .innerRadius(20)
  //   .dimension(calculation)
  //   .group(calculationGroup)
  //   .title(function(d){return Math.round(d.value) + ' kWh';});

    alternativesChart.width(300)
    .height(300)
    .radius(100)
    // .minWidth(0)
    // .minHeight(0)
    .innerRadius(20)
    .dimension(alternatives)
    .group(alternativesGroup);
    //.title(function(d){return d.value;});

    // propertiesChart.width(null)
    // .height(null)
    // .minWidth(0)
    // .margins({top: 5, left: 10, right: 10, bottom: 20})
    // .dimension(calculationByProperty)
    // .group(calculationByPropertyGroup)
    // .label(function (d){
    //    return d.key;
    // })
    // .title(function(d){return Math.round(d.value) + ' kWh';})
    // .elasticX(true)
    // .xAxis().ticks(3);

    kpiTable
         .dimension(kpi)
         .group(function (d) {
             return d.variantName;
         })
         .size(100) 
        .columns([
            function(d) {
              return '<a href="#/variant-input/' + d.variantId + '">' + d.kpiName + '</a>';
            },
            function(d) {
              return d.value + ' ' + d.unit;
            },
            function(d) {
              return d.bad + ' ' + d.unit;
            },
            function(d) {
              return d.excellent + ' ' + d.unit;
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
              return '<a href="#/variant-input/' + d.variantId + '">' + d.variantName + '</a>';
            },
            function(d) {
              return d.value + ' ' + d.unit;
            },
            function(d) {
              return d.bad + ' ' + d.unit;
            },
            function(d) {
              return d.excellent + ' ' + d.unit;
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
          };

          // watch for width change on parent element
          // scope.$watch('containerElement.clientWidth', function(newWidth) {
          //   console.log('changed width: ' + newWidth);
          //   width = newWidth - margin.left - margin.right;
          //   return scope.render(scope.mcmsmv);
          // });

          // watch for width change on parent element
          scope.$watch('data', function(newLayers, oldLayers) {
            //console.log('changed layers:');
            //console.log(newLayers);
            if(newLayers !== oldLayers) {
              return scope.render(scope.data);
            }
          });

          scope.render(scope.data);

        }

      };
}]);
