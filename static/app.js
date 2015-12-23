(function () {
    var STATUSES = [
        {id: 0, className: 'info', name: 'Запланировано'},
        {id: 1, className: 'warning', name: 'Выполняется'},
        {id: 2, className: 'success', name: 'Выполнено'},
        {id: 3, className: 'danger', name: 'Не запланировано'}
    ];

    var app = angular.module('app', ['ngDraggable', 'ui.bootstrap']);

    app.config(configure);
    configure.$inject = ['$interpolateProvider'];
    function configure($interpolateProvider) {
        $interpolateProvider.startSymbol('{[');
        $interpolateProvider.endSymbol(']}');
    }

    app.factory('HistoryService', HistoryService);
    HistoryService.$inject = ['$http'];
    function HistoryService($http) {
        var service = {};

        service.list = list;
        service.create = create;
        service.update = update;
        service.delete = del;

        return service;

        ////////////////////

        function list() {
            return $http.get('/api/history')
                .then(function (response) {
                    return response.data.objects;
                });
        }

        function create(history) {
            return $http.post('/api/history', history)
                .then(function (response) {
                    return response.data;
                });
        }

        function update(history) {
            return $http.put('/api/history/' + history.id, history)
                .then(function (response) {
                    return response.data;
                })
        }

        function del(history) {
            return $http.delete('/api/history/' + history.id);
        }
    }

    app.factory('IssueService', IssueService);
    IssueService.$inject = ['$http'];
    function IssueService($http) {
        var service = {};

        service.update = update;
        service.create = create;
        service.delete = del;

        return service;

        ////////////////////

        function create(issue) {
            return $http.post('/api/issue', issue)
                .then(function (response) {
                    return response.data;
                });
        }

        function update(issue) {
            return $http.put('/api/issue/' + issue.id, issue)
                .then(function (response) {
                    return response.data;
                });
        }

        function del(issue) {
            return $http.delete('/api/issue/' + issue.id);
        }
    }

    app.controller('IssueModalController', IssueModalController);
    IssueModalController.$inject = ['$uibModalInstance', 'issue'];
    function IssueModalController($uibModalInstance, issue) {
        var vm = this;

        vm.ok = ok;
        vm.cancel = cancel;

        vm.issue = issue;
        vm.statuses = STATUSES;
        vm.status = vm.statuses[vm.issue.status];

        ////////////////////

        function ok() {
            console.log('asd');
            vm.issue.status = vm.status.id;
            $uibModalInstance.close(vm.issue);
        }

        function cancel() {
            console.log('asd');
            $uibModalInstance.dismiss('cancel');
        }
    }

    app.controller('HistoryModalController', HistoryModalController);
    HistoryModalController.$inject = ['$uibModalInstance', 'history'];
    function HistoryModalController($uibModalInstance, history) {
        var vm = this;

        vm.ok = ok;
        vm.cancel = cancel;

        vm.history = history;
        vm.statuses = STATUSES;
        vm.status = vm.statuses[vm.history.status];

        ////////////////////

        function ok() {
            console.log('asd');
            vm.history.status = vm.status.id;
            $uibModalInstance.close(vm.history);
        }

        function cancel() {
            console.log('asd');
            $uibModalInstance.dismiss('cancel');
        }
    }

    app.controller('AppController', AppController);
    AppController.$inject = ['$uibModal', 'HistoryService', 'IssueService'];
    function AppController($uibModal, HistoryService, IssueService) {
        var vm = this;

        vm.onDragSuccess = onDragSuccess;
        vm.onDropSuccess = onDropSuccess;

        vm.addIssue = addIssue;
        vm.editIssue = editIssue;
        vm.deleteIssue = deleteIssue;

        vm.addHistory = addHistory;
        vm.editHistory = editHistory;
        vm.deleteHistory = deleteHistory;

        vm.statuses = STATUSES;

        init();

        ////////////////////

        function init() {
            getHistories();
        }

        function getHistories() {
            HistoryService.list()
                .then(function (histories) {
                    vm.histories = histories;
                });
        }

        function onDragSuccess($data, $event) {
            //console.log($data, $event);
        }

        function onDropSuccess($data, $event, targetStatus, targetHistory) {
            console.log($data);
            if (!$data) {
                return;
            }

            $data.status = targetStatus;
            $data.history_id = targetHistory.id;
            //targetHistory.issues.push($data);
            IssueService.update($data)
                .then(function (issue) {
                    console.log(issue);
                    getHistories();
                });
        }

        function openIssueModal(issue) {
            return $uibModal.open({
                templateUrl: 'issueForm.html',
                controller: IssueModalController,
                controllerAs: 'modal',
                bindToController: true,
                resolve: {
                    issue: issue
                }
            });
        }

        function openHistoryModal(history) {
            return $uibModal.open({
                templateUrl: 'historyForm.html',
                controller: HistoryModalController,
                controllerAs: 'modal',
                bindToController: true,
                resolve: {
                    history: history
                }
            });
        }

        function addIssue(history) {
            openIssueModal({history: {id: history.id, name: history.name}, timing: 1, status: 3, priority: 0})
                .result
                .then(function (issue) {
                    return IssueService.create(issue);
                })
                .then(function (issue) {
                    console.log(issue);
                    return getHistories();
                });

        }

        function editIssue(issue) {
            openIssueModal(issue)
                .result
                .then(function (issue) {
                    return IssueService.update(issue);
                })
                .then(function (issue) {
                    console.log(issue);
                    return getHistories();
                });
        }

        function deleteIssue(issue) {
            IssueService.delete(issue)
                .then(function () {
                    return getHistories();
                });
        }

        function addHistory() {
            openHistoryModal({status: 3, priority: 0})
                .result
                .then(function (history) {
                    return HistoryService.create(history)
                })
                .then(function (issue) {
                    console.log(issue);
                    return getHistories();
                });
        }

        function editHistory(history) {
            openHistoryModal(history)
                .result
                .then(function (history) {
                    return HistoryService.update(history);
                })
                .then(function (history) {
                    console.log(history);
                    return getHistories();
                });
        }

        function deleteHistory(history) {
            HistoryService.delete(history)
                .then(function () {
                    return getHistories();
                });
        }

    }

})();