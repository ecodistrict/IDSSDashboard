angular.module('idss-dashboard').directive('mcmsmv', ['$window',function ($window) {

      var d3 = window.d3;

      var x, y, xAxis, yAxis, svg, width;

      var margin = {top: 2, right: 2, bottom: 2, left: 2};

      return {
        restrict: 'E',
        scope: {
          data: "="
        },
        link: function(scope, element, attrs) {

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

            console.log(element);

            if(!mcmsmvData || !width) {
              return;
            }

            console.log(width);
            
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
                    // a value needs to be set
                    var kpiValue = kpi.kpiValue || 0;
                    // if disable the value should be zero
                    if(kpi.disabled) {
                      kpiValue = 0;
                    }
                    data.push({
                      stakeholder: stakeholder.user.name,
                      userId: stakeholder.user.id,
                      variantId: variant.variantId,
                      variantName: variant.name,
                      kpiName: metadata[kpi.kpiId].kpiName,
                      kpiAlias: metadata[kpi.kpiId].kpiId,
                      bad: metadata[kpi.kpiId].bad,
                      excellent: metadata[kpi.kpiId].excellent,
                      value: kpiValue,
                      disabled: kpi.disabled,
                      kpiIndex: metadata[kpi.kpiId].index,
                      unit: metadata[kpi.kpiId].unit,
                      count: kpiCounter
                    });
                    kpiCounter++;
                  });
                });
            });

            element.append([
              // '<div class="col-xs-12">',
              // ' <div id="calc-year-chart"></div>',
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
                '      <th>Stakeholder</th>',
                '      <th>KPI value</th>',
                '      <th>Bad</th>',
                '      <th>Excellent</th>',
                '    </tr>',
                '</thead>',
              ' </table>',
              '</div>'
            ].join(''));

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

      var stakeholder = ndx.dimension(function (d) {
        return d.stakeholder;
      });
      var stakeholderGroup = stakeholder.group().reduceSum(function(d) {
        return d.value;
      });

      var alternatives = ndx.dimension(function (d) {
        return d.variantName;
      });
      var alternativesGroup = alternatives.group().reduceSum(function(d) {
        return d.value;
      });


  kpiChart.width(width * 0.4)
    .height(300)
    //.minWidth(0)
    //.margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(kpi)
    .group(kpiGroup)
    .colors(d3.scale.category10())
    .label(function (d){
       return d.key + ' ' + d.value;
    })
    // .title(function(d) {return d.kpiName;})
    .elasticX(true)
    .xAxis().ticks(4);

   
  stakeholderChart.width(width * 0.2)
    .height(300)
    .radius(width * 0.1)
    .innerRadius(20)
    .dimension(stakeholder)
    .group(stakeholderGroup);

  alternativesChart.width(width * 0.2)
    .height(300)
    .radius(width * 0.1)
    .innerRadius(20)
    .dimension(alternatives)
    .group(alternativesGroup);
    //.title(function(d){return d.value;});

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
              return d.disabled ? 'n/a' : d.value + ' ' + d.unit;
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
              return '<a href="#/kpi?variantId=' + d.variantId + '&kpiAlias=' + d.kpiAlias + '&back=compare-variants&userId=' + d.userId + '&stakeholder=' + d.stakeholder +'">' + d.variantName + '</a>';
            },
            function(d) {
              return d.stakeholder;
            },
            function(d) {
              return d.disabled ? 'n/a' : d.value + ' ' + d.unit;
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

        }

      };
}]);
