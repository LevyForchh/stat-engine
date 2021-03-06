'use strict';

import angular from 'angular';

import AppsResource from './apps.service';
import EmailResource from './email.service';
import ExtensionConfigurationResource from './extension-configuration.service';
import ExtensionResource from './extension.service';
import FireDepartmentResource from './fire-department.service';
import ReportResource from './report.service';
import WeatherResource from './weather.service';
import SafetyResource from './safety.service';
import StatsResource from './stats.service';
import TwitterResource from './twitter.service';
import UserResource from './user.service';
import IncidentResource from './incident.service';
import UnitResource from './unit.service';

export default angular.module('statEngineApp.api', [])
  .factory('Apps', AppsResource)
  .factory('Email', EmailResource)
  .factory('Extension', ExtensionResource)
  .factory('ExtensionConfiguration', ExtensionConfigurationResource)
  .factory('FireDepartment', FireDepartmentResource)
  .factory('Report', ReportResource)
  .factory('Twitter', TwitterResource)
  .factory('User', UserResource)
  .factory('Weather', WeatherResource)
  .factory('Stats', StatsResource)
  .factory('Safety', SafetyResource)
  .factory('Incident', IncidentResource)
  .factory('Unit', UnitResource)
  .name;
