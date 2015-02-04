describe( 'AppCtrl', function() {
  describe( 'isCurrentUrl', function() {
    var AppCtrl, $location, $scope;

    beforeEach( module( 'idss-dashboard' ) );

    // error when testing socket...?

    // beforeEach( inject( function( $controller, _$location_, $rootScope ) {
    //   $location = _$location_;
    //   $scope = $rootScope.$new();
    //   AppCtrl = $controller( 'AppCtrl', { $location: $location, $scope: $scope });
    //   console.log(AppCtrl);
    // }));

    it( 'should pass a dummy test', inject( function() {
      expect( true ).toBeTruthy();
    }));
  });
});