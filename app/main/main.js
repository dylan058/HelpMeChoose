/**
 * Created by Dylan on 15/1/11.
 */

angular.module('main', ['ngRoute', 'ngTouch', 'ngAnimate', 'ui.slider', 'firebase'])

    .value('DEFAULT_DATA', "{\"id\":null,\"events\":[{\"description\":\"What's for dinner?\",\"options\":[{\"description\":\"Hamburger\",\"weight\":1},{\"description\":\"Pizza\",\"weight\":1}]}]}")

    .value('DEFAULT_ADD_STRING', 'Tap to Add')

    .service('Data', function (DEFAULT_DATA, $firebaseObject) {
        var Data = {};
        Data.string = '';


        Data.save = function () {
            Data.string = angular.toJson(Data.data);
            localStorage.data = Data.string;
        };

        Data.reset = function () {
            var result = !Data.data || window.confirm('Do you really want to reset your data? It is irreversible.');
            if (result) {
                Data.string = DEFAULT_DATA;
                Data.data = angular.fromJson(Data.string);
                localStorage.data = Data.string;
            }
        };

        Data.upload = function () {
            return new Promise(function (resolve, reject) {
                if (DEFAULT_DATA == Data.string) {
                    alert('No modified data!')
                    reject();
                    return;
                }
                var uid = Data.data.id;
                if (!uid) {
                    Data.data.id = uid = generateUid(8);
                }
                Data.save();
                var ref = new Firebase('https://resplendent-inferno-8580.firebaseio.com/' + uid);
                var fbObj = $firebaseObject(ref);
                fbObj.$value = Data.string;
                fbObj.$save().then(function () {
                    alert('Done! Your data id is \'' + uid + '\'.');
                    resolve();
                }, function (error) {
                    reject(error);
                });
            });
        };

        Data.download = function () {
            return new Promise(function (resolve, reject) {
                var uid = prompt('What\'s your data id?');
                if (null != uid && 8 == uid.trim().length) {
                    var ref = new Firebase('https://resplendent-inferno-8580.firebaseio.com/' + uid);
                    var fbObj = $firebaseObject(ref);
                    fbObj.$loaded().then(function (data) {
                        Data.string = data.$value;
                        console.log(data);
                        Data.data = angular.fromJson(Data.string);
                        localStorage.data = Data.string;
                        resolve(data);
                    }).catch(function (error) {
                        reject(error);
                    });
                } else {
                    if (null != uid) alert('Illegal data id!');
                    reject();
                }
            });
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
            array = array.filter(function (element) {
                return element.weight > 0;
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
        $scope.uid = $scope.data.id;
        $scope.newItem = DEFAULT_ADD_STRING;

        $scope.removeItem = function (index) {
            $scope.items.splice(index, 1);
            Data.save();
        };

        $scope.reset = function () {
            Data.reset();
            $scope.data = Data.data;
            $scope.items = $scope.data.events;
            $scope.uid = $scope.data.id;
        };

        $scope.upload = function () {
            $scope.dataTransfering = true;
            Data.upload().then(function () {
                $scope.data = Data.data;
                $scope.items = $scope.data.events;
                $scope.uid = $scope.data.id;
                $scope.dataTransfering = false;
                $scope.$applyAsync();
            }).catch(function (error) {
                if (error) {
                    alert('Error');
                    console.log(error);
                }
                $scope.dataTransfering = false;
                $scope.$applyAsync();
            });
        };

        $scope.download = function () {
            $scope.dataTransfering = true;
            Data.download().then(function () {
                console.log('hello');
                $scope.data = Data.data;
                $scope.items = $scope.data.events;
                $scope.uid = $scope.data.id;
                $scope.dataTransfering = false;
                $scope.$applyAsync();
            }).catch(function (error) {
                if (error) {
                    alert('Error!');
                    console.log(error);
                }
                $scope.dataTransfering = false;
                $scope.$applyAsync();
            });
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