"use strict";

window.env = window.env || {}; //FIX tests

if(window.env.language && window.env.language.momentLang && window.env.language.momentLangCode){
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.text = window.env.language.momentLang;
  head.appendChild(script);
  moment.lang(window.env.language.momentLangCode);
}

window.env.t = function(string){
  return (window.env.translations[string] || window.env.translations.stringNotFound);
}

window.habitrpg = angular.module('habitrpg',
    ['ngResource', 'ngSanitize', 'userServices', 'groupServices', 'memberServices', 'challengeServices',
     'authServices', 'notificationServices', 'guideServices',
     'ui.bootstrap', 'ui.keypress', 'ui.router', 'chieffancypants.loadingBar', 'At', 'pasvaz.bindonce'])

  // @see https://github.com/angular-ui/ui-router/issues/110 and https://github.com/HabitRPG/habitrpg/issues/1705
  // temporary hack until they have a better solution
  .value('$anchorScroll', angular.noop)

  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)
  //.constant("STORAGE_GROUPS_ID", "") // if we decide to take groups offline

  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'STORAGE_SETTINGS_ID',
    function($stateProvider, $urlRouterProvider, $httpProvider, STORAGE_SETTINGS_ID) {

      $urlRouterProvider
        // Setup default selected tabs
        .when('/options', '/options/profile/avatar')
        .when('/options/profile', '/options/profile/avatar')
        .when('/options/groups', '/options/groups/tavern')
        .when('/options/groups/guilds', '/options/groups/guilds/public')
        .when('/options/inventory', '/options/inventory/drops')
        .when('/options/settings', '/options/settings/settings')

        // redirect states that don't match
        .otherwise("/tasks");

      $stateProvider

        // Tasks
        .state('tasks', {
          url: "/tasks",
          templateUrl: "partials/main.html"
        })

        // Options
        .state('options', {
          url: "/options",
          templateUrl: "partials/options.html",
          controller: function(){}
        })

        // Options > Profile
        .state('options.profile', {
          url: "/profile",
          templateUrl: "partials/options.profile.html",
          controller: 'UserCtrl'
        })
        .state('options.profile.avatar', {
          url: "/avatar",
          templateUrl: "partials/options.profile.avatar.html"
        })
        .state('options.profile.stats', {
          url: "/stats",
          templateUrl: "partials/options.profile.stats.html"
        })
        .state('options.profile.profile', {
          url: "/profile",
          templateUrl: "partials/options.profile.profile.html"
        })

        // Options > Groups
        .state('options.social', {
          url: "/groups",
          templateUrl: "partials/options.social.html"
        })
        .state('options.social.tavern', {
          url: "/tavern",
          templateUrl: "partials/options.social.tavern.html",
          controller: 'TavernCtrl'
        })
        .state('options.social.party', {
          url: '/party',
          templateUrl: "partials/options.social.party.html",
          controller: 'PartyCtrl'
        })
        .state('options.social.guilds', {
          url: '/guilds',
          templateUrl: "partials/options.social.guilds.html",
          controller: 'GuildsCtrl'
        })
        .state('options.social.guilds.public', {
          url: '/public',
          templateUrl: "partials/options.social.guilds.public.html"
        })
        .state('options.social.guilds.create', {
          url: '/create',
          templateUrl: "partials/options.social.guilds.create.html"
        })
        .state('options.social.guilds.detail', {
          url: '/:gid',
          templateUrl: 'partials/options.social.guilds.detail.html',
          controller: ['$scope', 'Groups', '$stateParams', function($scope, Groups, $stateParams){
            $scope.group = Groups.Group.get({gid:$stateParams.gid});
          }]
        })

        // Options > Social > Challenges
        .state('options.social.challenges', {
          url: "/challenges",
          controller: 'ChallengesCtrl',
          templateUrl: "partials/options.social.challenges.html"
        })
        .state('options.social.challenges.detail', {
          url: '/:cid',
          templateUrl: 'partials/options.social.challenges.detail.html',
          controller: ['$scope', 'Challenges', '$stateParams',
            function($scope, Challenges, $stateParams){
              $scope.obj = $scope.challenge = Challenges.Challenge.get({cid:$stateParams.cid}, function(){
                $scope.challenge._locked = true;
              });
            }]
        })
        .state('options.social.challenges.detail.member', {
          url: '/:uid',
          templateUrl: 'partials/options.social.challenges.detail.member.html',
          controller: ['$scope', 'Challenges', '$stateParams',
            function($scope, Challenges, $stateParams){
              $scope.obj = Challenges.Challenge.getMember({cid:$stateParams.cid, uid:$stateParams.uid}, function(){
                $scope.obj._locked = true;
              });
            }]
        })

        // Options > Inventory
        .state('options.inventory', {
          url: '/inventory',
          templateUrl: "partials/options.inventory.html",
          controller: 'InventoryCtrl'
        })
        .state('options.inventory.drops', {
          url: '/drops',
          templateUrl: "partials/options.inventory.drops.html"
        })
        .state('options.inventory.pets', {
          url: '/pets',
          templateUrl: "partials/options.inventory.pets.html"
        })
        .state('options.inventory.mounts', {
          url: '/mounts',
          templateUrl: "partials/options.inventory.mounts.html"
        })
        .state('options.inventory.equipment', {
          url: '/equipment',
          templateUrl: "partials/options.inventory.equipment.html"
        })

        // Options > Settings
        .state('options.settings', {
          url: "/settings",
          controller: 'SettingsCtrl',
          templateUrl: "partials/options.settings.html"
        })
        .state('options.settings.settings', {
          url: "/settings",
          templateUrl: "partials/options.settings.settings.html"
        })
        .state('options.settings.api', {
          url: "/api",
          templateUrl: "partials/options.settings.api.html"
        })
        .state('options.settings.export', {
          url: "/export",
          templateUrl: "partials/options.settings.export.html"
        })

        // Options > Settings
        .state('options.admin', {
          url: "/admin",
          controller: 'AdminCtrl',
          templateUrl: "partials/options.admin.html"
        })

      var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
      if (settings && settings.auth) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['x-api-user'] = settings.auth.apiId;
        $httpProvider.defaults.headers.common['x-api-key'] = settings.auth.apiToken;
      }

      // Handle errors
      var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
        function success(response) {
          return response;
        }
        function error(response) {
          //var status = response.status;
          response.data = (response.data.err) ? response.data.err : response.data;
          if (response.status == 0) response.data = 'Server currently unreachable.';
          if (response.status == 500) response.data += ' (see Chrome console for more details).';

          var error = response.status == 0 ? response.data : ('Error ' + response.status + ': ' + response.data);
          $rootScope.$broadcast('responseError', error);
          console.log(arguments);
          return $q.reject(response);
        }
        return function (promise) {
          return promise.then(success, error);
        }
      }];
      $httpProvider.responseInterceptors.push(interceptor);
  }])