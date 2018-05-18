'use strict';

import _ from 'lodash';
import angular from 'angular';

export default class UserController {
  user = {};
  errors = {};
  submitted = false;

  /*@ngInject*/
  constructor(User, currentUser, fireDepartments, $state) {
    this.UserService = User;
    this.user = currentUser || {};
    this.fireDepartments = fireDepartments;
    this.$state = $state;

    this.userRoles = {
      ingest: this.user.isIngest,
      kibana_admin: this.user.isKibanaAdmin,
      department_admin: this.user.isDepartmentAdmin,
      admin: this.user.isAdmin,
    };

    this.requestedFireDepartment = _.find(this.fireDepartments, f => f._id === this.user.requested_fire_department_id);
    this.assignedFireDepartment = _.find(this.fireDepartments, f => f._id === this.user.fire_department__id);

    this.newUser = this.user._id === undefined;
  }

  updateUser(form) {
    this.submitted = true;

    if(form.$valid) {
      let roles = ['user'];

      if(this.userRoles.ingest) roles.push('ingest');
      if(this.userRoles.kibana_admin) roles.push('kibana_admin');
      if(this.userRoles.department_admin) roles.push('department_admin');
      if(this.userRoles.admin) roles.push('admin');
      this.user.role = roles.join(',');

      if(this.assignedFireDepartment) {
        this.user.requested_fire_department_id = null;
        this.user.fire_department__id = this.assignedFireDepartment._id;
      } else if(this.requestedFireDepartment) {
        this.user.requested_fire_department_id = this.requestedFireDepartment._id;
        this.user.fire_department__id = null;
      }

      if(this.user._id) {
        this.UserService.update({ id: this.user._id }, this.user).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            if(err.data.error) this.errors.error = err.data.error;
            else this.errors.error = 'Error saving data.';
          });
      } else {
        this.UserService.create(this.user).$promise
          .then(() => {
            this.$state.go('site.admin.home');
          })
          .catch(err => {
            err = err.data;
            this.errors = {};

            // Update validity of form fields that match the sequelize errors
            if(err.name) {
              angular.forEach(err.errors, field => {
                form[field.path].$setValidity('mongoose', false);
                this.errors[field.path] = err.message;
              });
            }
          });
      }
    }
  }
}