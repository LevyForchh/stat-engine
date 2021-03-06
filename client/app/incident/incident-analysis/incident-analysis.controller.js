/* eslint  class-methods-use-this: 0 */

'use strict';

import humanizeDuration from 'humanize-duration';

let _;
let tippy;

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
});

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(AmplitudeService, AnalyticEventNames, currentPrincipal, incidentData) {
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.incidentData = incidentData;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    tippy = await import(/* webpackChunkName: "tippy" */ 'tippy.js');
    tippy = tippy.default;
  }

  async $onInit() {
    await this.loadModules();

    this.groupedUnits = _.groupBy(this.incidentData.incident.apparatus, u => u.suppressed);

    this.suppressedUnits = this.groupedUnits.true;
    this.incidentData.incident.apparatus = this.groupedUnits.false;

    this.incident = this.incidentData.incident;

    this.type = _.get(this.incident, 'description.extended_data.AgencyIncidentCallTypeDescription') || this.incident.description.type;
    this.subtype = this.incident.description.subtype;
    this.firstUnitDispatched = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    this.firstUnitArrived = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    let comments = _.get(this.incident, 'description.comments');
    if(comments) {
      let limit = 500;
      this.showFullComments = false;
      this.commentsTruncated = comments.substring(0, limit);
      this.isCommentsTruncated = comments.length > limit;
    }

    this.textSummaries = this.incidentData.textSummaries;
    this.analysis = this.incidentData.analysis;
    this.comparison = this.incidentData.comparison;
    this.travelMatrix = this.incidentData.travelMatrix;
    this.concurrentIncidents = this.incidentData.concurrent;

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
      app: 'Incident Analysis',
      action: 'view',
    });

    const incident = this.incident;
    this.concurrentIncidentTableOptions = {
      data: [],
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>',
      }, {
        field: 'description.event_opened',
        displayName: 'Event Opened'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'description.units.length',
        displayName: '# Units',
        width: 75,
      }, {
        field: 'address.battalion',
        displayName: 'Battalion',
        cellClass: (grid, row, col) => {
          if(grid.getCellValue(row, col) == incident.address.battalion) {
            return 'text-danger';
          }
        },
        width: 100,
      }, {
        field: 'address.response_zone',
        displayName: 'Response Zone',
        cellClass: (grid, row, col) => {
          if(grid.getCellValue(row, col) == incident.address.response_zone) {
            return 'text-danger';
          }
        },
        width: 100,
      }, {
        field: 'description.category',
        displayName: 'Category',
        width: 100,
      }, {
        field: 'description.type',
        displayName: 'Type',
      }]
    };
    this.formatSearchResults(this.concurrentIncidents);

    this.initialized = true;
    this.initTippy();
  }

  initTippy() {
    console.dir(tippy);

    tippy('.tippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '350px',
      inertia: false,
      touch: true,
    });

    // dynamic content
    tippy('.ruletippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '350px',
      dynamicTitle: true,
      inertia: false,
      touch: true,
    });
  }

  formatEvidence(evidence) {
    let html = '<ul class="pd-5 mg-5">';
    _.forEach(evidence, e => {
      switch (e.grade) {
      case 'SUCCESS':
        html += `<li class="tippy-text tx-success">${e.text}</li>`;
        break;

      case 'WARNING':
        html += `<li class="tippy-text tx-warning">${e.text}</li>`;
        break;

      case 'DANGER':
        html += `<li class="tippy-text tx-danger">${e.text}</li>`;
        break;
      }
    });

    html += '</ul>';

    return html;
  }

  formatSearchResults(results) {
    const searchResults = [];

    _.forEach(results, r => searchResults.push(r._source));

    this.concurrentIncidentTableOptions.data = searchResults;
    this.concurrentIncidentTableOptions.minRowsToShow = searchResults.length || 5;
  }


  scrollTo(location) {
    $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
  }

  toggleComments() {
    if(this.showFullComments) $('#fullComments').collapse('show');
    else $('#fullComments').collapse('hide');
    this.showFullComments = !this.showFullComments;
  }

  humanizeDuration(ms) {
    if (_.isNil(ms) || _.isNaN(ms)) return 'N/A';
    return shortEnglishHumanizer(ms, { round: true });
  }
}
