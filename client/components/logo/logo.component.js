'use strict';

import angular from 'angular';

export class LogoController {
  constructor() {
    'ngInject';
  }

  src() {
    return `https://s3.amazonaws.com/statengine-public-assets/logos/${this.department.firecares_id}.png`;
  }
}

export default angular.module('logo', [])
  .component('logo', {
    template: require('./logo.component.html'),
    controller: LogoController,
    controllerAs: 'vm',
    bindings: {
      department: '<',
    },
  })
  .directive('errSrc', function() {
    return {
      link: (scope, element, attrs) => {
        element.bind('error', () => {
          if(attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  })
  .name;