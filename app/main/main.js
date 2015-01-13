/**
 * Created by Dylan on 15/1/11.
 */

angular.module('main', ['ngRoute', 'ui.slider'])

    .value('DEFAULT_DATA', "{\"id\":null,\"events\":[{\"description\":\"What's for dinner?\",\"options\":[{\"description\":\"Hamburger\",\"weight\":0},{\"description\":\"Pizza\",\"weight\":1}]}]}")

    .value('DEFAULT_ADD_STRING', '+ ADD')

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

    .service('getRandomElementByWeight', function () {
        return function (array) {
            if (!Array.isArray(array)) return null;
            array = array.filter(function (elment) {
                return elment.weight > 0;
            })
            if (0 === array.length) return null;
            if (1 === array.length) return array[0];
            var tempArray = [];
            var sum = 0;
            for (var i = 0; i < array.length; i++) {
                tempArray[i] = sum;
                sum += array[i].weight;
            }
            tempArray.push(sum);
            var random = Math.random() * sum;
            // binary search
            var l = 0, r = tempArray.length - 1, m = Math.floor((l + r) / 2);
            while (l + 1 < r) {
                tempArray[m] > random ? (r = m) : (l = m);
                m = Math.floor((l + r) / 2);
            }
            return array[l];
        }
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

    .controller('MainCtrl', function ($scope, $location, Data, DEFAULT_ADD_STRING) {
        $scope.data = Data.data;
        $scope.description = 'Help Me Choose';
        $scope.items = $scope.data.events;
        $scope.newItem = DEFAULT_ADD_STRING;

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.reset = function () {
            Data.reset();
            $scope.data = Data.data;
            $scope.items = $scope.data.events;
        };

        $scope.canAddItem = function () {
            return 10 >= $scope.items.length;
        }

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== DEFAULT_ADD_STRING && $scope.newItem !== '') {
                $scope.items.push({
                    description: $scope.newItem,
                    options    : []
                });
                Data.save();
            }
            $scope.newItem = DEFAULT_ADD_STRING;
            $location.path('/event/' + ($scope.items.length - 1));
        };

        $scope.inputOnFocus = function () {
            $scope.newItem = '';
        };

        $scope.inputOnKeypress = function ($event) {
            if (13 === $event.keyCode) {
                $scope.addItem();
                $event.target.blur();
            }
        }
    })

    .controller('EventCtrl', function ($scope, $routeParams, Data, DEFAULT_ADD_STRING, getRandomElementByWeight) {
        $scope.eventIndex = $routeParams.eventIndex;
        $scope.event = Data.data.events[$scope.eventIndex];
        $scope.description = $scope.event.description;
        $scope.items = $scope.event.options;
        $scope.newItem = DEFAULT_ADD_STRING;
        $scope.result = null;

        $scope.addOption = function (option) {

        };

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.setOptionDescription = function (index, description) {

        };

        $scope.setOptionWeight = function (index) {
            return function (weight) {
                if (10 < weight) weight = 10;
                if (1 > weight) weight = 1;
                weight = Math.floor(weight);
                $scope.items[index].weight = weight;
                Data.save();
            }
        }

        $scope.canAddItem = function () {
            return 10 >= $scope.items.length;
        }

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== DEFAULT_ADD_STRING && $scope.newItem !== '') {
                $scope.items.push({
                    description: $scope.newItem,
                    weight     : 1
                });
                Data.save();
            }
            $scope.newItem = DEFAULT_ADD_STRING;
        };

        $scope.inputOnFocus = function () {
            $scope.newItem = '';
        };

        $scope.inputOnKeypress = function ($event) {
            if ($event.keyCode === 13) {
                $event.target.blur();
            }
        };

        $scope.generateResult = function () {
            // TODO
            $scope.result = getRandomElementByWeight($scope.items);
        }

        $scope.clearResult = function () {
            $scope.result = null;
        }
    });