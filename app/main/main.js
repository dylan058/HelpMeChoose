/**
 * Created by Dylan on 15/1/11.
 */

angular.module('main', ['ngRoute'])

    .value('DEFAULT_DATA', "{\"id\":null,\"events\":[{\"description\":\"What's for dinner?\",\"options\":[{\"description\":\"Hamburger\",\"weight\":1.2},{\"description\":\"Pizza\",\"weight\":1.2}]}]}")

    .service('Data', function (DEFAULT_DATA) {
        var Data = {};

        Data.save = function () {
            localStorage.data = angular.toJson(Data.data);
        };

        Data.reset = function () {
            Data.data = angular.fromJson(DEFAULT_DATA);
            localStorage.data = DEFAULT_DATA;
        };

        if (localStorage.data && localStorage.data.length > 0) {
            try {
                Data.data = JSON.parse(localStorage.data);
            } catch (error) {
            }
        }

        if (!Data.data) Data.reset();

        return Data;
    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller : 'MainCtrl',
                templateUrl: 'main/main.tpl.html'
            })
            .when('/event/:eventIndex', {
                controller : 'EventCtrl',
                templateUrl: 'main/main.tpl.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })

    .controller('MainCtrl', function ($scope, $location, Data) {
        $scope.data = Data.data;
        $scope.description = 'Help Me Choose';
        $scope.items = $scope.data.events;
        $scope.newItem = '+';

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.reset = function () {
            Data.reset();
            $scope.data = Data.data;
            $scope.items = $scope.data.events;
        };

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== '+' && $scope.newItem !== '') {
                $scope.items.push({
                    description: $scope.newItem,
                    options    : []
                });
                Data.save();
            }
            $scope.newItem = '+';
            $location.path('/event/' + ($scope.items.length - 1));
        }

        $scope.inputOnFocus = function () {
            $scope.newItem = '';
        }

        $scope.inputOnKeypress = function ($event) {
            if ($event.keyCode === 13) {
                $scope.addItem();
                $event.target.blur();
            }
        }
    })

    .controller('EventCtrl', function ($scope, $routeParams, Data) {
        $scope.eventIndex = $routeParams.eventIndex;
        $scope.event = Data.data.events[$scope.eventIndex];
        $scope.description = $scope.event.description;
        $scope.items = $scope.event.options;
        $scope.newItem = '+';

        $scope.addOption = function (option) {

        };

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.setOptionDescription = function (index, description) {

        };

        $scope.setOptionWeight = function (index, weight) {

        }

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== '+' && $scope.newItem !== '') {
                $scope.items.push({
                    description: $scope.newItem,
                    weight: 1
                });
                Data.save();
            }
            $scope.newItem = '+';
        }

        $scope.inputOnFocus = function () {
            $scope.newItem = '';
        }

        $scope.inputOnKeypress = function ($event) {
            if ($event.keyCode === 13) {
                $scope.addItem();
                $event.target.blur();
            }
        }
    });