/**
 * Created by Dylan on 15/1/11.
 */

angular.module('main', ['ngRoute', 'ngTouch', 'ngAnimate', 'ui.slider'])

    .value('DEFAULT_DATA', "{\"id\":null,\"events\":[{\"description\":\"What's for dinner?\",\"options\":[{\"description\":\"Hamburger\",\"weight\":1},{\"description\":\"Pizza\",\"weight\":1}]}]}")

    .value('DEFAULT_ADD_STRING', 'Tap to Add')

    .service('Data', function (DEFAULT_DATA) {
        var Data = {};

        Data.save = function () {
            localStorage.data = angular.toJson(Data.data);
        };

        Data.reset = function () {
            var result = window.confirm('Do you really want to reset your data? It is irreversible.');
            if (result) {
                Data.data = angular.fromJson(DEFAULT_DATA);
                localStorage.data = DEFAULT_DATA;
            }
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
            });
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
        };

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== DEFAULT_ADD_STRING && $scope.newItem !== '') {
                $scope.items.unshift({
                    description: $scope.newItem,
                    options    : []
                });
                Data.save();
                $location.path('/event/0');
            }
            $scope.newItem = DEFAULT_ADD_STRING;
        };

        $scope.inputOnFocus = function () {
            $scope.newItem = '';
        };

        $scope.inputOnKeypress = function ($event) {
            if (13 === $event.keyCode) {
                $scope.addItem();
                $event.target.blur();
            }
        };

        $scope.onClick = function (obj, $index) {
            obj.position !== '' ? (obj.position = '') : $location.path('/event/' + $index);
        }
    })

    .controller('EventCtrl', function ($scope, $routeParams, Data, DEFAULT_ADD_STRING, getRandomElementByWeight) {
        $scope.eventIndex = $routeParams.eventIndex;
        $scope.event = Data.data.events[$scope.eventIndex];
        $scope.description = $scope.event.description;
        $scope.items = $scope.event.options;
        $scope.newItem = DEFAULT_ADD_STRING;
        $scope.result = null;

        $scope.items.forEach(function (element) {
            element.$setWeight = function (weight) {
                if (10 < weight) weight = 10;
                if (1 > weight) weight = 1;
                weight = Math.floor(weight);
                element.weight = weight;
                Data.save();
            }
        });

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.setOptionDescription = function (index, description) {

        };

        $scope.canAddItem = function () {
            return 10 >= $scope.items.length;
        };

        $scope.addItem = function () {
            $scope.newItem = $scope.newItem.trim();
            if ($scope.newItem !== DEFAULT_ADD_STRING && $scope.newItem !== '') {
                $scope.items.unshift({
                    description: $scope.newItem,
                    weight     : 1,
                    $setWeight : function (weight) {
                        if (10 < weight) weight = 10;
                        if (1 > weight) weight = 1;
                        weight = Math.floor(weight);
                        this.weight = weight;
                        Data.save();
                    }
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
            $scope.result = null;
            setTimeout(function() {
                $scope.result = getRandomElementByWeight($scope.items);
                $scope.$apply();
            }, 500);
        };

        $scope.clearResult = function () {
            $scope.result = null;
        };

        $scope.swipeLeft = function (obj) {
            switch (obj.position) {
                case 'slide-right':
                    obj.position = '';
                    break;
                case '':
                    obj.position = 'slide-left';
            }
        };

        $scope.swipeRight = function (obj) {
            switch (obj.position) {
                case 'slide-left':
                    obj.position = '';
                    break;
                case '':
                    obj.position = 'slide-right';
            }
        }
    });