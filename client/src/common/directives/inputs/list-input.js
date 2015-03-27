angular.module('idss-dashboard').directive('listInput', ['ProcessService', '$compile', 'ModuleService', function (ProcessService, $compile, ModuleService) {

    return {
        restrict: 'E',
        scope: {
            input: '=',
            variantid: '=', 
            moduleid: '=',
            kpialias: '='
        },
        link: function(scope, element, attrs) {

            // use the original inputs for default
            scope.userInput = angular.copy(scope.input.inputs);

            scope.selectedListPosts = [];

            console.log(scope.variantid);
            console.log(scope.moduleid);
            console.log(scope.kpialias);
            console.log(scope.input);

            var setUserInput = function(listPost) {

                _.each(scope.userInput, function(input) {
                        
                    input.value = listPost[input.id] || input.value;

                });
                    
            };

            scope.saveList = function() {

                console.log(scope.selectedListPosts);

                _.each(scope.selectedListPosts, function(post) {

                    console.log(post);
                    post.isNew = false;
                    post.selected = false;
                    console.log(scope.userInput);

                    _.each(scope.userInput, function(input) {
                        
                        post[input.id] = input.value || post[input.id];

                    });

                });

                scope.unselectAllListPosts();

                ModuleService.saveModuleInput(scope.variantid, {
                    moduleId: scope.moduleid, 
                    kpiId: scope.kpialias,
                    inputs: [{
                        id: scope.input.id, // only id and value are updated on save module input
                        value: scope.input.value
                    }]
                });

            };
            
            var initListData = function(input) {

                scope.input.value = scope.input.value || [];

                // Is this function really needed?
                // More to add here?

            };

            // each time click on new, add new to selectedList (this will make it possible to create many at same time)
            scope.addListPost = function() {
                var newPost = createNewPost();
                newPost.isNew = true;
                newPost.selected = true;
                setUserInput(newPost);
                scope.selectedListPosts.push(newPost);
                scope.input.value.push(newPost);
            };

            var createNewPost = function() {
                var post = {};
                _.each(scope.input.inputs, function(input) {
                    post[input.id] = input.value;
                });
                return post;
            };

            scope.deleteListPost = function(post, discrete) {
                var index = _.indexOf(scope.input.value, post);
                if(index !== -1) {
                    scope.input.value.splice(index, 1);
                }
                if(!discrete) {
                    ModuleService.saveModuleInput(scope.variantid, {
                        moduleId: scope.moduleid, 
                        kpiId: scope.kpialias,
                        inputs: [{
                            id: scope.input.id, // only id and value are updated on save module input
                            value: scope.input.value
                        }]
                    });
                }
            };

            scope.toggleListPost = function(post) {
                post.selected = !post.selected;
                if(post.selected) {
                    setUserInput(post);
                    scope.selectedListPosts.push(post);
                } else {
                    unselectListPost(post);
                }
                
            };

            scope.unselectAllListPosts = function() {
                while(scope.selectedListPosts.length > 0) {
                    scope.selectedListPosts.pop();
                }
                _.each(scope.input.value, function(post) {
                    post.selected = false;
                    if(post.isNew) {
                        scope.deleteListPost(post, true);
                    }
                });
            };

            var unselectListPost = function(post){
                var index = _.indexOf(scope.selectedListPosts, post);
                if(index !== -1) {
                    scope.selectedListPosts.splice(index, 1);
                }
            };

            initListData(scope.input);

            // create directive, copy input.inputs to every selected feature
            var featurePanel = angular.element([
                '<div class="clearfix"><a ng-click="addListPost()" class="btn btn-primary pull-right">Add {{input.entity}}</a></div>',
                '<div id="input-list" class="well">',
                    '<div id="properties-panel" ng-show="selectedListPosts.length > 0" class="panel panel-default">',
                        '<div class="panel-heading"><label>{{selectedListPosts.length}} selected {{input.entity}}</label>',
                        '</div>',
                        '<div class="panel-body"><kpi-input inputs=userInput></kpi-input></div>',
                        '<div class="panel-footer clearfix">',
                            '<div class="pull-right">',
                                '<a ng-click="unselectAllListPosts()" class="btn btn-danger">Cancel</a>',
                                '<a ng-click="saveList()" class="btn btn-succes">Save</a>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div ng-repeat="post in input.value">',
                        '<div class="panel panel-default clearfix" ng-class="post.selected ? \'panel-warning\' : \'panel-default\'">',
                            '<div class="panel-heading" ng-click="toggleListPost(post)">',
                                '<label>Name: {{post.name}}</label>',
                                '<button class="btn btn-xs btn-danger pull-right" ng-click="deleteListPost(post);$event.stopPropagation()"><i class="glyphicon glyphicon-trash"></i> Delete</button>',
                                //'<label ng-show="!post.name">New {{$parent.input.entity}}</label>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>'
                ].join(''));
            $compile(featurePanel)(scope);
            element.append(featurePanel);

        }
    };
}]);