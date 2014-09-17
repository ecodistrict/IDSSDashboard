angular.module('templates-app', ['00-start/start.tpl.html', '00-start/upload.tpl.html', '01-analyse-problem/analyse-problem.tpl.html', '01-analyse-problem/configure-kpi.tpl.html', '01-analyse-problem/kpi-input.tpl.html', '01-analyse-problem/manage-kpis.tpl.html', '01-analyse-problem/use-kpi.tpl.html', '02-collect-data/collect-data.tpl.html', '02-collect-data/define-context.tpl.html', '02-collect-data/file-result.tpl.html', '02-collect-data/module-input.tpl.html', '03-as-is/as-is.tpl.html', '04-to-be/ambitions-kpi.tpl.html', '04-to-be/to-be-overview.tpl.html', '04-to-be/to-be.tpl.html', '05-develop-variants/develop-variants.tpl.html', '05-develop-variants/use-alternatives.tpl.html', '05-develop-variants/variant-overview.tpl.html', '06-assess-variants/asses-variants.tpl.html', '06-assess-variants/assess-variants.tpl.html', 'export/export.tpl.html', 'header/header.tpl.html', 'login/login.tpl.html', 'modules/modules.tpl.html', 'user/user.tpl.html']);

angular.module("00-start/start.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("00-start/start.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-sm-6 col-md-4 col-md-offset-4\">\n" +
    "            <div class=\"well\">\n" +
    "                <a ui-sref=\"upload-process\" class=\"btn btn-lg btn-primary btn-block\">Upload .ecodist file</a>\n" +
    "                <a ng-click=\"startNewProcess()\" class=\"btn btn-lg btn-success btn-block\">Create new project</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("00-start/upload.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("00-start/upload.tpl.html",
    "<div class=\"container\">\n" +
    "    <h2>Import .ecodist file: </h2>\n" +
    "    <input ng-file-select type=\"file\" />\n" +
    "    <table ng-show=\"uploader.queue.length > 0\" class=\"table\">\n" +
    "        <thead>\n" +
    "            <tr>\n" +
    "                <th width=\"50%\">Name</th>\n" +
    "                <th ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                <th ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                <th>Status</th>\n" +
    "                <th>Actions</th>\n" +
    "            </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "            <tr ng-repeat=\"item in uploader.queue\">\n" +
    "                <td><strong>{{ item.file.name }}</strong></td>\n" +
    "                <td ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                <td ng-show=\"uploader.isHTML5\">\n" +
    "                    <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                        <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                    </div>\n" +
    "                </td>\n" +
    "                <td class=\"text-center\">\n" +
    "                    <span ng-show=\"item.isSuccess\"><i class=\"glyphicon glyphicon-ok\"></i></span>\n" +
    "                    <span ng-show=\"item.isCancel\"><i class=\"glyphicon glyphicon-ban-circle\"></i></span>\n" +
    "                    <span ng-show=\"item.isError\"><i class=\"glyphicon glyphicon-remove\"></i></span>\n" +
    "                </td>\n" +
    "                <td nowrap>\n" +
    "                    <button type=\"button\" class=\"btn btn-success btn-xs\" ng-click=\"item.upload()\" ng-disabled=\"item.isReady || item.isUploading || item.isSuccess\">\n" +
    "                        <span class=\"glyphicon glyphicon-upload\"></span> Upload\n" +
    "                    </button>\n" +
    "                    <button type=\"button\" class=\"btn btn-warning btn-xs\" ng-click=\"item.cancel()\" ng-disabled=\"!item.isUploading\">\n" +
    "                        <span class=\"glyphicon glyphicon-ban-circle\"></span> Cancel\n" +
    "                    </button>\n" +
    "                    <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-click=\"item.remove()\">\n" +
    "                        <span class=\"glyphicon glyphicon-trash\"></span> Remove\n" +
    "                    </button>\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>");
}]);

angular.module("01-analyse-problem/analyse-problem.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("01-analyse-problem/analyse-problem.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <h1>Analyse problem</h1>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <label for=\"process-title\">Please give a title to this decision process (ex: your high level ambition):</label>\n" +
    "            <input type=\"text\" ng-model=\"currentProcess.title\" class=\"form-control\" id=\"process-title\" placeholder=\"Process title\">\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        \n" +
    "        <!-- <p ng-show=\"currentProcess.district.area\">Area: {{(currentProcess.district.area / 10) | number : 0}} m<sup>2</sup></p>\n" +
    "        <span ng-show=\"currentProcess.district.geometry\" ng-repeat=\"geo in currentProcess.district.geometry[0]\">\n" +
    "            {{geo}}\n" +
    "        </span> -->\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <label for=\"process-description\">Please add a description text of your project (optional):</label>\n" +
    "            <textarea class=\"form-control\" id=\"process-description\" rows=\"3\">This project is aimed at…</textarea>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <label for=\"process-stakeholder\">Please name the stakeholders of this project:</label>\n" +
    "            <input type=\"text\" id=\"process-stakeholder\" class=\"form-control\" autocomplete=\"result\" placeholder=\"Not implemented\"/>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"manage-kpis\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<label>Please define the area of your project: </label>\n" +
    "        <district-map width=\"600px\" height=\"300px\" style=\"width:600px;height:300px\" class=\"selection-map\" district=\"currentProcess.district\" layer=\"layer\"></district-map>\n" +
    "        <select ng-model=\"layer\" ng-options=\"l.name as l.label for l in layerOptions\">\n" +
    "        </select>");
}]);

angular.module("01-analyse-problem/configure-kpi.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("01-analyse-problem/configure-kpi.tpl.html",
    "<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modalInstance\" aria-hidden=\"true\">&times;</button>\n" +
    "	<h3>{{ kpi.name }}</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "	<h3>Input and configuration</h3>\n" +
    "	<p class=\"explanation-message\">[ Input and configuration of this KPI ]</p>\n" +
    "	<kpi-input inputs=\"kpi.inputs\"></kpi-input>\n" +
    "	<h3>Select module</h3>\n" +
    "	<select ng-model=\"kpi.selectedModule\" ng-options=\"module.name for module in relevantModules\">\n" +
    "		<option value=\"\">-- select module --</option>\n" +
    "	</select>\n" +
    "	\n" +
    "</div>	\n" +
    "<div class=\"modal-footer\">\n" +
    "	<a class=\"btn btn-sm btn-warning\" ng-click=\"cancel()\">Cancel</a>\n" +
    "	<a class=\"btn btn-sm btn-danger\" ng-click=\"removeKpiFromProcess()\">Don't use this KPI</a>\n" +
    "	<a class=\"btn btn-primary btn-sm\" ng-click=\"ok()\">Ok</a>\n" +
    "</div>	");
}]);

angular.module("01-analyse-problem/kpi-input.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("01-analyse-problem/kpi-input.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"btn btn-primary\" ui-sref=\"manage-kpis\"><span class=\"glyphicon glyphicon-chevron-left\"></span> Kpi list</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <h1 ng-show=\"kpi\">Input data for kpi <i>\"{{kpi.name}}\"</i></h1>\n" +
    "        <h1 ng-show=\"!kpi\">No kpi was found</i></h1>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <kpi-input inputs=\"kpi.inputs\"></kpi-input>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"btn btn-primary pull-right\" ui-sref=\"manage-kpis\"> Next kpi <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "            <button class=\"btn btn-primary pull-left\" ui-sref=\"manage-kpis\"><span class=\"glyphicon glyphicon-chevron-left\"></span> Previous kpi</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("01-analyse-problem/manage-kpis.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("01-analyse-problem/manage-kpis.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <h2>KPI database</h2>\n" +
    "            <div ng-repeat=\"kpi in kpiList\" class=\"panel panel-default kpi-item\" ng-click=\"useKpi(kpi)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{kpi.name}}</h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                {{kpi.description}}\n" +
    "              </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <h2>KPI set for this decision process</h2>\n" +
    "            <div ng-repeat=\"kpi in currentProcess.kpiList\" class=\"panel panel-success kpi-item\" ng-click=\"configureKpi(kpi)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{kpi.name}} <span ng-hide=\"kpiIsConfigured(kpi)\" class=\"glyphicon glyphicon-exclamation-sign\"></span></h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                {{kpi.description}}\n" +
    "              </div>\n" +
    "            </div>\n" +
    "            <button class=\"btn btn-primary btn-xs pull-right\" ng-show=\"currentProcess.kpiList.length\">\n" +
    "                <span class=\"glyphicon glyphicon-floppy-disk\"></span> Save this KPI set\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"currentProcess.kpiList.length > 0\" class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"define-context\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("01-analyse-problem/use-kpi.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("01-analyse-problem/use-kpi.tpl.html",
    "<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modalInstance\" aria-hidden=\"true\">&times;</button>\n" +
    "	<h3>{{ kpi.name }}</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "	<h3>Info</h3>\n" +
    "	<p class=\"explanation-message\">[ Info on this KPI ]</p>\n" +
    "	<h3>Relevant modules</h3>\n" +
    "	<div ng-show=\"relevantModules.length === 0\">There are no modules registered for this KPI</div>\n" +
    "	<div ng-repeat=\"module in relevantModules\">\n" +
    "		{{module.name}}\n" +
    "	</div>		\n" +
    "	<a ui-sref=\"modules\">Browse module database</a>\n" +
    "</div>	\n" +
    "<div class=\"modal-footer\">\n" +
    "	<a class=\"btn btn-sm btn-danger\" ng-click=\"cancel()\">Don't use this KPI</a>\n" +
    "	<a class=\"btn btn-primary btn-sm\" ng-click=\"useKPI()\">Use this KPI</a>\n" +
    "</div>	");
}]);

angular.module("02-collect-data/collect-data.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("02-collect-data/collect-data.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        \n" +
    "        <h2>Modules in KPI selection (<a ui-sref=\"manage-kpis\">manage kpis</a>)</h2>\n" +
    "        <div ng-show=\"!currentProcess.kpiList.length\">No kpis are registered</div>\n" +
    "        <div ng-repeat=\"module in moduleList\" class=\"panel panel-primary module-item\" ui-sref=\"module-input({kpiId: module.kpi.id, moduleId: module.module.id})\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{module.module.name}} <span ng-hide=\"moduleIndataIsOk(module)\" class=\"glyphicon glyphicon-exclamation-sign\"></span></h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "            <div>\n" +
    "                From KPI: {{module.kpi.name}}\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"as-is\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("02-collect-data/define-context.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("02-collect-data/define-context.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-6\">\n" +
    "        	<h2>Context variable database</h2>\n" +
    "            <div ng-repeat=\"variable in selectableContextVariables\" class=\"panel panel-info context-item\" ng-click=\"useVariable(variable)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{variable.name}}</h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                <div ng-show=\"variable.requiredBy.length\">\n" +
    "                    Required by: \n" +
    "                    <div ng-repeat=\"label in variable.requiredBy\">{{label}}</div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <h2>Current context</h2>\n" +
    "            <div ng-repeat=\"variable in currentProcess.context.variables\" class=\"panel panel-info context-item\" ng-click=\"useContext(context)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{context.name}}</h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                Required by: \n" +
    "                <div ng-repeat=\"label in context.requiredBy\">{{label}}</div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"collect-data\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("02-collect-data/file-result.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("02-collect-data/file-result.tpl.html",
    "<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modalInstance\" aria-hidden=\"true\">&times;</button>\n" +
    "	<h3>Uploaded file</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "	<geojson-map data=\"data\"></geojson-map>\n" +
    "</div>	\n" +
    "<div class=\"modal-footer\">\n" +
    "	<a class=\"btn btn-primary btn-sm\" ng-click=\"ok()\">Ok</a>\n" +
    "</div>	\n" +
    "\n" +
    "");
}]);

angular.module("02-collect-data/module-input.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("02-collect-data/module-input.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"btn btn-primary\" ui-sref=\"collect-data\"><span class=\"glyphicon glyphicon-chevron-left\"></span> Module list</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <h1 ng-show=\"module\">Input data for module <i>\"{{module.name}}\"</i></h1>\n" +
    "        <h1 ng-show=\"!module\">No module was found</i></h1>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <!-- <module-input module-inputs=\"module.inputs\"></module-input> -->\n" +
    "        <div ng-repeat=\"input in module.inputs\" ng-include=\"input.template\"></div>\n" +
    "        <!-- <div ng-repeat=\"input in module.inputs\">\n" +
    "\n" +
    "            <div ng-if=\"input.type == 'text'\">\n" +
    "            </div>\n" +
    "            <div ng-if=\"input.type == 'aggregation'\">\n" +
    "                <h3>{{input.label}}</h3>\n" +
    "                <div id=\"inputAggregationMenu\">Properties menu</div>\n" +
    "                <div aggregation-map inputs=\"input.inputs\" data=\"input.inputs[0].data\"></div>\n" +
    "                {{input.inputs[0].label}} file import: <input ng-file-select type=\"file\" />\n" +
    "                <table ng-show=\"uploader.queue.length > 0\" class=\"table\">\n" +
    "                    <thead>\n" +
    "                        <tr>\n" +
    "                            <th width=\"50%\">Name</th>\n" +
    "                            <th ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "                            <th ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "                            <th>Status</th>\n" +
    "                            <th>Actions</th>\n" +
    "                        </tr>\n" +
    "                    </thead>\n" +
    "                    <tbody>\n" +
    "                        <tr ng-repeat=\"item in uploader.queue\">\n" +
    "                            <td><strong>{{ item.file.name }}</strong></td>\n" +
    "                            <td ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "                            <td ng-show=\"uploader.isHTML5\">\n" +
    "                                <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                                    <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                                </div>\n" +
    "                            </td>\n" +
    "                            <td class=\"text-center\">\n" +
    "                                <span ng-show=\"item.isSuccess\"><i class=\"glyphicon glyphicon-ok\"></i></span>\n" +
    "                                <span ng-show=\"item.isCancel\"><i class=\"glyphicon glyphicon-ban-circle\"></i></span>\n" +
    "                                <span ng-show=\"item.isError\"><i class=\"glyphicon glyphicon-remove\"></i></span>\n" +
    "                            </td>\n" +
    "                            <td nowrap>\n" +
    "                                <button type=\"button\" class=\"btn btn-success btn-xs\" ng-click=\"uploadFile(item, input.inputs[0])\" ng-disabled=\"item.isReady || item.isUploading || item.isSuccess\">\n" +
    "                                    <span class=\"glyphicon glyphicon-upload\"></span> Upload\n" +
    "                                </button>\n" +
    "                                <button type=\"button\" class=\"btn btn-warning btn-xs\" ng-click=\"item.cancel()\" ng-disabled=\"!item.isUploading\">\n" +
    "                                    <span class=\"glyphicon glyphicon-ban-circle\"></span> Cancel\n" +
    "                                </button>\n" +
    "                                <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-click=\"item.remove()\">\n" +
    "                                    <span class=\"glyphicon glyphicon-trash\"></span> Remove\n" +
    "                                </button>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                    </tbody>\n" +
    "                </table>\n" +
    "            </div>\n" +
    "        </div> -->\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"btn btn-primary pull-right\" ui-sref=\"collect-data\"> Next module <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "            <button class=\"btn btn-primary pull-left\" ui-sref=\"collect-data\"><span class=\"glyphicon glyphicon-chevron-left\"></span> Previous module</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("03-as-is/as-is.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("03-as-is/as-is.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\" ng-if=\"processing\">\n" +
    "        \n" +
    "        <h2>Processing is beeing done, please wait</h2>\n" +
    "        <div ng-repeat=\"kpi in currentProcess.kpiList\" class=\"panel {{'panel-' + kpi.selectedModule.status}} module-item\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{kpi.selectedModule.name}} <span ng-show=\"kpi.selectedModule.isProcessing\" class=\"glyphicon glyphicon-refresh spin\"></span></h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "            {{kpi.selectedModule.status}}\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\" ng-if=\"!processing\">\n" +
    "        \n" +
    "        <h2>As is situation</h2>\n" +
    "        <div ng-repeat=\"kpi in currentProcess.kpiList\" class=\"panel {{'panel-' + kpi.selectedModule.status}} module-item\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{kpi.name}}</h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "            <div ng-repeat=\"output in kpi.selectedModule.outputs\" ng-include=\"output.template\"></div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"to-be\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("04-to-be/ambitions-kpi.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("04-to-be/ambitions-kpi.tpl.html",
    "<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modalInstance\" aria-hidden=\"true\">&times;</button>\n" +
    "	<h3>{{ kpi.name }}</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "	<h3>Input and configuration</h3>\n" +
    "	<p class=\"explanation-message\">[ Input and configuration of this KPI ]</p>\n" +
    "	<kpi-input inputs=\"kpi.inputs\"></kpi-input>\n" +
    "	<h3>Using module</h3>\n" +
    "	<p>{{kpi.selectedModule.name}}</p>\n" +
    "	\n" +
    "</div>	\n" +
    "<div class=\"modal-footer\">\n" +
    "	<a class=\"btn btn-sm btn-warning\" ng-click=\"cancel()\">Cancel</a>\n" +
    "	<a class=\"btn btn-primary btn-sm\" ng-click=\"ok()\">Ok</a>\n" +
    "</div>	");
}]);

angular.module("04-to-be/to-be-overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("04-to-be/to-be-overview.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            \n" +
    "          <div class=\"row\">\n" +
    "              \n" +
    "              <h2>As is situation</h2>\n" +
    "              <div ng-repeat=\"kpi in currentProcess.kpiList\" class=\"panel {{'panel-' + kpi.selectedModule.status}} module-item\">\n" +
    "                <div class=\"panel-heading\">\n" +
    "                  <h3 class=\"panel-title\">{{kpi.name}}</h3>\n" +
    "                </div>\n" +
    "                <div class=\"panel-body\">\n" +
    "                  <div ng-repeat=\"output in kpi.selectedModule.outputs\" ng-include=\"output.template\"></div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "              \n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <div class=\"row\" ng-show=\"processing\">\n" +
    "        \n" +
    "              <h2>Processing is beeing done, please wait</h2>\n" +
    "              <div ng-repeat=\"kpi in currentProcess.kpiListToBe\" class=\"panel {{'panel-' + kpi.selectedModule.status}} module-item\">\n" +
    "                <div class=\"panel-heading\">\n" +
    "                  <h3 class=\"panel-title\">{{kpi.selectedModule.name}} <span ng-show=\"kpi.selectedModule.isProcessing\" class=\"glyphicon glyphicon-refresh spin\"></span></h3>\n" +
    "                </div>\n" +
    "                <div class=\"panel-body\">\n" +
    "                  {{kpi.selectedModule.status}}\n" +
    "                </div>\n" +
    "              </div>\n" +
    "              \n" +
    "          </div>\n" +
    "          <div class=\"row\" ng-show=\"!processing\">\n" +
    "              \n" +
    "              <h2>To be situation</h2>\n" +
    "              <div ng-repeat=\"kpi in currentProcess.kpiListToBe\" class=\"panel {{'panel-' + kpi.selectedModule.status}} module-item\">\n" +
    "                <div class=\"panel-heading\">\n" +
    "                  <h3 class=\"panel-title\">{{kpi.name}}</h3>\n" +
    "                </div>\n" +
    "                <div class=\"panel-body\">\n" +
    "                  <div ng-repeat=\"output in kpi.selectedModule.outputs\" ng-include=\"output.template\"></div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "              \n" +
    "          </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\" ng-show=\"!processing\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"develop-variants\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("04-to-be/to-be.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("04-to-be/to-be.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "            <h2>To be - go through KPIs again to set ambitions</h2>\n" +
    "            <div ng-repeat=\"kpi in currentProcess.kpiList\" class=\"panel panel-success kpi-item\" ng-click=\"configureKpi(kpi)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{kpi.name}} <span ng-hide=\"kpiIsConfigured(kpi)\" class=\"glyphicon glyphicon-exclamation-sign\"></span></h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                {{kpi.description}}\n" +
    "              </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"currentProcess.kpiList.length > 0\" class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"to-be-overview\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("05-develop-variants/develop-variants.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("05-develop-variants/develop-variants.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button ng-show=\"selectedContext && selectedAlternative\" ng-click=\"addVariant()\" class=\"pull-right btn btn-success\">Create variant <span class=\"glyphicon glyphicon-check\"></span></button>\n" +
    "            <button ng-show=\"!selectedContext || !selectedAlternative\" class=\"pull-right btn btn-default\">New variant</button>\n" +
    "            \n" +
    "            <button ng-show=\"selectedContext\" class=\"pull-right btn btn-info\">{{selectedContext.name}}</button>\n" +
    "            <button ng-show=\"!selectedContext\" class=\"pull-right btn btn-default\">Select a context</button>\n" +
    "\n" +
    "            <button ng-show=\"selectedAlternative\" class=\"pull-right btn btn-warning\">{{selectedAlternative.name}}</button>\n" +
    "            <button ng-show=\"!selectedAlternative\" class=\"pull-right btn btn-default\">Select an alternative</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-xs-6\">\n" +
    "          <h2>Select module alternatives</h2>\n" +
    "          <div ng-repeat=\"module in moduleList\" class=\"panel panel-primary module-item\" ng-click=\"useAlternative(module)\">\n" +
    "            <div class=\"panel-heading\">\n" +
    "              <h3 class=\"panel-title\">{{module.name}} <span ng-hide=\"moduleIndataIsOk(module)\" class=\"glyphicon glyphicon-exclamation-sign\"></span></h3>\n" +
    "            </div>\n" +
    "            <div class=\"panel-body\">\n" +
    "              Alternatives:\n" +
    "              <div ng-repeat=\"alternative in module.alternatives\">\n" +
    "                {{alternative.name}}\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-6\">\n" +
    "            <h2>Select context</h2>\n" +
    "            <div ng-repeat=\"variable in selectableContextVariables\" class=\"panel panel-info context-item\" ng-click=\"selectContext(variable)\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <h3 class=\"panel-title\">{{variable.name}}</h3>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body\">\n" +
    "                <div ng-show=\"variable.requiredBy.length\">\n" +
    "                    Required by: \n" +
    "                    <div ng-repeat=\"label in variable.requiredBy\">{{label}}</div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"collect-data\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("05-develop-variants/use-alternatives.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("05-develop-variants/use-alternatives.tpl.html",
    "<div class=\"modal-header\">\n" +
    "	<button type=\"button\" class=\"close\" ng-click=\"cancel()\" data-dismiss=\"modalInstance\" aria-hidden=\"true\">&times;</button>\n" +
    "	<h3>{{ module.name }}</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "	<div ng-repeat=\"alternative in module.alternatives\" class=\"panel panel-warning\" ng-click=\"setSelectedAlternative(alternative)\">\n" +
    "		<div ng-model=\"module.selectedAlternative\" class=\"panel-heading\">{{alternative.name}}</div>\n" +
    "	</div>\n" +
    "</div>	\n" +
    "<div class=\"modal-footer\">\n" +
    "	<a class=\"btn btn-sm btn-danger\" ng-click=\"cancel()\">Don't save this alternative</a>\n" +
    "	<a ng-show=\"module.selectedAlternative\" class=\"btn btn-primary btn-sm\" ng-click=\"saveAlternative()\">Save this alternative</a>\n" +
    "</div>	");
}]);

angular.module("05-develop-variants/variant-overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("05-develop-variants/variant-overview.tpl.html",
    "<div class=\"container\">\n" +
    "  <div class=\"row\" ng-show=\"processing\">\n" +
    "        \n" +
    "        <h2>Processing is beeing done, please wait</h2>\n" +
    "        <div ng-repeat=\"variant in currentProcess.variants\" class=\"panel panel-warning module-item\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{variant.alternative.name}} + {{variant.context.name}} <span ng-show=\"variant.isProcessing\" class=\"glyphicon glyphicon-refresh spin\"></span></h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "            {{variant.status}}\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\" ng-show=\"!processing\">\n" +
    "        \n" +
    "        <h2>Variants</h2>\n" +
    "        <div ng-show=\"!currentProcess.variants.length\">No variants are created</div>\n" +
    "        <div ng-repeat=\"variant in currentProcess.variants\" class=\"panel panel-warning module-item\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{variant.alternative.name}} + {{variant.context.name}}</h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "                <div ng-repeat=\"output in variant.alternative.outputs\" ng-include=\"output.template\">\n" +
    "                </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"assess-variants\">Next <span class=\"glyphicon glyphicon-chevron-right\"></span></button>\n" +
    "            <button class=\"pull-right btn btn-warning\" ui-sref=\"develop-variants\">Create new variant</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("06-assess-variants/asses-variants.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("06-assess-variants/asses-variants.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        \n" +
    "        <h2>Modules in KPI selection (<a ui-sref=\"manage-kpis\">manage kpis</a>)</h2>\n" +
    "        <div ng-show=\"!currentProcess.kpiList.length\">No kpis are registered</div>\n" +
    "        <div ng-repeat=\"module in moduleList\" class=\"panel panel-primary module-item\" ui-sref=\"{{module.sref}}\">\n" +
    "          <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{module.module}} <span ng-hide=\"moduleIndataIsOk(module)\" class=\"glyphicon glyphicon-exclamation-sign\"></span></h3>\n" +
    "          </div>\n" +
    "          <div class=\"panel-body\">\n" +
    "            <div ng-show=\"variable.requiredBy.length\">\n" +
    "                Required by: {{module.kpi}}\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <form role=\"form\">\n" +
    "          <div class=\"form-group\">\n" +
    "            <button class=\"pull-right btn btn-primary\" ui-sref=\"manage-kpis\">Next</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("06-assess-variants/assess-variants.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("06-assess-variants/assess-variants.tpl.html",
    "<div class=\"container\">\n" +
    "  <h2>[not implemented]</h2>  \n" +
    "</div>");
}]);

angular.module("export/export.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("export/export.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <h1>Export <i>{{currentProcess.title}}</i></h1>\n" +
    "        <p>Some options here..</p>\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"downloadCurrentProcess()\">Download this process as .ecodist file</button>\n" +
    "        <br>\n" +
    "        <a ng-show=\"exportTitle\" href=\"{{exportResult}}\">Download link: {{exportTitle}}</a>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("header/header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header/header.tpl.html",
    "<nav class=\"navbar navbar-default\" role=\"navigation\">\n" +
    "    <div class=\"container-fluid\">\n" +
    "        <div ng-show=\"isAuthenticated\" class=\"navbar-header\">\n" +
    "            <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#bs-navbar-collapse\">\n" +
    "                <span class=\"icon-bar\"></span>\n" +
    "                <span class=\"icon-bar\"></span>\n" +
    "                <span class=\"icon-bar\"></span>\n" +
    "            </button>\n" +
    "            <a ui-sref=\"start\" class=\"navbar-brand\"><i class=\"fa fa-list-alt\"></i> IDSS Dashboard</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-show=\"!isAuthenticated\" class=\"navbar-header\">\n" +
    "            <a ui-sref=\"start\" class=\"navbar-brand\"><i class=\"fa fa-list-alt\"></i> IDSS Dashboard</a>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"collapse navbar-collapse\" id=\"bs-navbar-collapse\">\n" +
    "            <!-- menu default -->\n" +
    "            <ul ng-show=\"isAuthenticated\" class=\"nav navbar-nav\">\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">Analyse problem <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"analyse-problem\">Overview</a></li>\n" +
    "                        <li class=\"divider\"></li>\n" +
    "                        <li><a ui-sref=\"manage-kpis\">Select KPIs</a></li>\n" +
    "                        <li class=\"submenu-item\" ng-repeat=\"kpi in currentProcess.kpiList\">\n" +
    "                            <a ui-sref=\"kpi-input({kpiId: kpi.id})\">- {{kpi.name}}</a>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">Collect data <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"define-context\">Define context</a></li>\n" +
    "                        <li class=\"divider\"></li>\n" +
    "                        <li><a ui-sref=\"collect-data\">Module input</a></li>\n" +
    "                        <li ng-repeat=\"kpi in currentProcess.kpiList\">\n" +
    "                            <a ng-if=\"kpi.selectedModule\" ui-sref=\"module-input({kpiId: kpi.id,moduleId: kpi.selectedModule.id})\">- {{kpi.selectedModule.name}}</a>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">As is <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"as-is\">Overview</a></li>\n" +
    "                        <!-- <li><a ui-sref=\"as-is-map\">Map</a></li>\n" +
    "                        <li><a ui-sref=\"as-is-details\">Details</a></li> -->\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">To be <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"to-be\">Set ambitions</a></li>\n" +
    "                        <li><a ui-sref=\"to-be-overview\">Overview</a></li>\n" +
    "                       <!--  <li><a ui-sref=\"to-be-map\">Map</a></li>\n" +
    "                        <li><a ui-sref=\"to-be-details\">Details</a></li> -->\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">Develop variants <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"develop-variants\">Create variant</a></li>\n" +
    "                        <li><a ui-sref=\"variant-overview\">Variant list</a></li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\">Assess variants <span class=\"caret\"></span></a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li><a ui-sref=\"assess-variants\">Overview</a></li>\n" +
    "                        <li><a>Export</a></li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "\n" +
    "            <ul ng-show=\"!isAuthenticated\" class=\"nav navbar-nav navbar-right\">\n" +
    "                <li><a style=\"cursor: pointer\" ng-click=\"login()\">Log in</a></li>\n" +
    "            </ul>\n" +
    "          \n" +
    "            <ul ng-show=\"isAuthenticated\" class=\"nav navbar-nav navbar-right\">\n" +
    "                <li class=\"dropdown\">\n" +
    "                    <a class=\"dropdown-toggle\"><span class=\"glyphicon glyphicon-cog\"></span> <b class=\"caret\"></b></a>\n" +
    "                    <ul class=\"dropdown-menu\">\n" +
    "                        <li><a ui-sref=\"current-user\"><span class=\"glyphicon glyphicon-user\"></span> {{ currentUser.name }}</a></li>\n" +
    "                        <li><a ng-click=\"logout()\"><span class=\"glyphicon glyphicon-log-out\"></span> Log out</a></li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"isAuthenticated && currentProcess.title\" class=\"container-fluid sub-menu navbar-inverse\">\n" +
    "        <ul class=\"nav navbar-nav\">\n" +
    "            <li class=\"dropdown\">\n" +
    "                <a class=\"dropdown-toggle\">{{ currentProcess.title }} <span class=\"caret\"></span></a>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li><a ui-sref=\"export\">Export to file</a></li>\n" +
    "                    <li><a ui-sref=\"upload-process\">Import from file</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "</nav>\n" +
    "\n" +
    "    \n" +
    "<!-- <h1>Start page</h1>\n" +
    "\n" +
    "<div ng-if=\"currentUser\">Welcome, {{ currentUser.name }}</div>\n" +
    "<div ng-if=\"isAuthorized(userRoles.admin)\">You're admin.</div>\n" +
    "<div ng-switch on=\"currentUser.role\">\n" +
    "  <div ng-switch-when=\"userRoles.admin\">You're admin.</div>\n" +
    "  <div ng-switch-when=\"userRoles.editor\">You're editor.</div>\n" +
    "  <div ng-switch-default>You're something else.</div>\n" +
    "</div> -->\n" +
    "");
}]);

angular.module("login/login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login/login.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-sm-6 col-md-4 col-md-offset-4\">\n" +
    "            <h1 class=\"text-center login-title\">Log in to IDSS Dashboard</h1>\n" +
    "            <div class=\"account-wall\">\n" +
    "                <form class=\"form-signin\" ng-submit=\"login(credentials)\">\n" +
    "                    <input ng-model=\"credentials.username\" type=\"text\" class=\"form-control\" placeholder=\"Email\" required autofocus>\n" +
    "                    <input ng-model=\"credentials.password\" type=\"password\" class=\"form-control\" placeholder=\"Password\" required>\n" +
    "                    <button class=\"btn btn-lg btn-primary btn-block\" type=\"submit\">Log in</button>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <a href=\"#\" class=\"text-center new-account\">Create an account </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("modules/modules.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("modules/modules.tpl.html",
    "<div class=\"container\">\n" +
    "    <h2>Registered modules</h2>\n" +
    "    <div ng-repeat=\"module in modules\" class=\"panel panel-primary module-item\">\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <h3 class=\"panel-title\">{{module.name}}</h3>\n" +
    "        </div>\n" +
    "        <div class=\"panel-body\">\n" +
    "            <div>\n" +
    "                {{module.description}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    \n" +
    "</div>");
}]);

angular.module("user/user.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("user/user.tpl.html",
    "<div class=\"container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-sm-6 col-md-4 col-md-offset-4\">\n" +
    "            <p>Username: {{ currentUser.name }}</p>\n" +
    "            <p>more settings here..	</p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);
