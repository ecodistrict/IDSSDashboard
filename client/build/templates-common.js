angular.module('templates-common', ['directives/file-source.tpl.html', 'directives/module-inputs/checkbox.tpl.html', 'directives/module-inputs/file.tpl.html', 'directives/module-inputs/geojson.tpl.html', 'directives/module-inputs/input-group.tpl.html', 'directives/module-inputs/number.tpl.html', 'directives/module-inputs/text.tpl.html', 'directives/module-outputs/geojson.tpl.html', 'directives/module-outputs/nvd3.tpl.html']);

angular.module("directives/file-source.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/file-source.tpl.html",
    "<h3>{{input.label}}</h3>\n" +
    "<input ng-file-select type=\"file\" />\n" +
    "<table ng-show=\"uploader.queue.length > 0\" class=\"table\">\n" +
    "    <thead>\n" +
    "        <tr>\n" +
    "            <th width=\"50%\">Name</th>\n" +
    "            <th ng-show=\"uploader.isHTML5\">Size</th>\n" +
    "            <th ng-show=\"uploader.isHTML5\">Progress</th>\n" +
    "            <th>Status</th>\n" +
    "            <th>Actions</th>\n" +
    "        </tr>\n" +
    "    </thead>\n" +
    "    <tbody>\n" +
    "        <tr ng-repeat=\"item in uploader.queue\">\n" +
    "            <td><strong>{{ item.file.name }}</strong></td>\n" +
    "            <td ng-show=\"uploader.isHTML5\" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>\n" +
    "            <td ng-show=\"uploader.isHTML5\">\n" +
    "                <div class=\"progress\" style=\"margin-bottom: 0;\">\n" +
    "                    <div class=\"progress-bar\" role=\"progressbar\" ng-style=\"{ 'width': item.progress + '%' }\"></div>\n" +
    "                </div>\n" +
    "            </td>\n" +
    "            <td class=\"text-center\">\n" +
    "                <span ng-show=\"item.isSuccess\"><i class=\"glyphicon glyphicon-ok\"></i></span>\n" +
    "                <span ng-show=\"item.isCancel\"><i class=\"glyphicon glyphicon-ban-circle\"></i></span>\n" +
    "                <span ng-show=\"item.isError\"><i class=\"glyphicon glyphicon-remove\"></i></span>\n" +
    "            </td>\n" +
    "            <td nowrap>\n" +
    "                <button type=\"button\" class=\"btn btn-success btn-xs\" ng-click=\"uploadFile(item)\" ng-disabled=\"item.isReady || item.isUploading || item.isSuccess\">\n" +
    "                    <span class=\"glyphicon glyphicon-upload\"></span> Upload\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-warning btn-xs\" ng-click=\"item.cancel()\" ng-disabled=\"!item.isUploading\">\n" +
    "                    <span class=\"glyphicon glyphicon-ban-circle\"></span> Cancel\n" +
    "                </button>\n" +
    "                <button type=\"button\" class=\"btn btn-danger btn-xs\" ng-click=\"item.remove()\">\n" +
    "                    <span class=\"glyphicon glyphicon-trash\"></span> Remove\n" +
    "                </button>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "<!-- <file-source-result type=\"type\" input=\"input\"></file-source-result> -->\n" +
    "<geojson-map ng-if=\"uploadedData\" data=\"uploadedData\"></geojson-map>\n" +
    "");
}]);

angular.module("directives/module-inputs/checkbox.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/checkbox.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "<div class=\"form-group\">\n" +
    "	<div class=\"col-sm-offset-4 col-sm-8\">\n" +
    "      <div class=\"checkbox\">\n" +
    "        <label>\n" +
    "          <input ng-model=\"input.value\" type=\"checkbox\"> {{input.label}}\n" +
    "        </label>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("directives/module-inputs/file.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/file.tpl.html",
    "<file-source input=\"input\"></file-source>");
}]);

angular.module("directives/module-inputs/geojson.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/geojson.tpl.html",
    "<file-source input=\"input\"></file-source>");
}]);

angular.module("directives/module-inputs/input-group.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/input-group.tpl.html",
    "<label class=\"module-input-label\">{{input.label}}</label>\n" +
    "<div ng-repeat=\"input in input.inputs\" ng-include=\"input.template\"></div>");
}]);

angular.module("directives/module-inputs/number.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/number.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "<div class=\"form-group\">\n" +
    "  <label for=\"input.id\" class=\"col-sm-4 control-label\">{{input.label}}</label>\n" +
    "  <div class=\"col-sm-8\">\n" +
    "    <div class=\"input-group\">\n" +
    "      <input ng-model=\"input.value\" id=\"input.id\" class=\"form-control text-right\" type=\"number\">\n" +
    "      <div class=\"input-group-addon\">{{input.unit}}</div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("directives/module-inputs/text.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-inputs/text.tpl.html",
    "<form class=\"form-horizontal\" role=\"form\">\n" +
    "<div class=\"form-group\">\n" +
    "  <label for=\"input.id\" class=\"col-sm-4 control-label\">{{input.label}}</label>\n" +
    "  <div class=\"col-sm-8\">\n" +
    "    <div class=\"input-group\">\n" +
    "      <input ng-model=\"input.value\" id=\"input.id\" class=\"form-control\" type=\"text\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("directives/module-outputs/geojson.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-outputs/geojson.tpl.html",
    "<geojson-map options=\"output.options\" data=\"output.data\"></geojson-map>");
}]);

angular.module("directives/module-outputs/nvd3.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("directives/module-outputs/nvd3.tpl.html",
    "<nvd3 options=\"output.options\" data=\"output.data\"></nvd3>");
}]);
