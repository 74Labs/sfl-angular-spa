'use strict';

angular.module('sfl.spa', [
    'ui.router',
    'sfl.ui',
    'sfl.auth',
    'pascalprecht.translate'
])

.constant('sflSpaDefaultConfig', {
    name: 'Angular SPA Seed',
    publicRegistrationEnabled: false,
    onlineCheckUrl: 'http://localhost:3000'
})

.provider('sflSpaConfig', function () {

    this.setName = function (value) {
        this.name = value;
    };
    
    this.setOnlineCheckUrl = function(value) {
        this.onlineCheckUrl = value;
    };
    
    this.enablePublicRegistration = function() {
        this.publicRegistrationEnabled = true;
    };
    
    this.disablePublicRegistration = function() {
        this.publicRegistrationEnabled = false;
    };    

    this.$get = function () {
        return this;
    };

})

.run(function ($log, sflSpaDefaultConfig, sflSpaConfig, sflSession) {
    // TODO
    var config = sflSpaDefaultConfig;
    $log.debug('SFL SPA Config', config);
    angular.forEach(config, function(value, property) {
        if(sflSpaConfig[property]) config[property] = sflSpaConfig[property];
        sflSession.set(property, config[property]);
    });
})

.config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'locales/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en_EN');
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useMissingTranslationHandlerLog();
})

.controller('sflSpaCtrl', function ($scope, $translate, sflSpaConfig, sflAuth, sflUi, sflSession, $http, $rootScope, $interval) {

    var self = this;

    self.online = true;

    $scope.logout = function () {
        sflUi.alerts.confirm($translate.instant('CONFIRM_LOGOUT'), function () {
            sflAuth.logout();
        });
    };

    $scope.checkOnlineStatus = function () {
        sflUi.loaders.show('online-check');
        $http.get(sflSpaConfig.onlineCheckUrl)
            .success(function () {
                sflUi.loaders.hide('check');
                if (!self.online) {
                    self.online = true;
                    sflSession.set('online', true);
                    $rootScope.$emit('online-status-changed', true);
                };
            })
            .error(function () {
                sflUi.loaders.hide('online-check');
                if (self.online) {
                    self.online = false;
                    sflSession.set('online', false);
                    $rootScope.$emit('online-status-changed', false);
                };
            });
    };

    $scope.checkOnlineStatus();

    $interval(function () {
        $scope.checkOnlineStatus();
    }, 10000);

})
