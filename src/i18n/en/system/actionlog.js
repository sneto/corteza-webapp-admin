export default {
  navItem: {
    label: 'Action log',
  },

  list: {
    title: 'Action log',

    loadOlder: 'Load older actions',

    columns: {
      timestamp: 'Timestamp',
      description: 'Description',
      resource: 'Resource',
      requestOrigin: 'Origin',
      action: 'Action',
      actor: 'User',
      severity: 'Severity',
    },

    filter: {
      from: 'Starting from',
      to: 'Ending at',
      today: 'today',
      resource: 'Resource',
      action: 'Action',
      actor: 'User ID',
      search: 'Search',
    },

    details: {
      'header': 'Details',
      'timestamp': 'Timestamp',
      'requestOrigin': 'Request Origin',
      'requestID': 'Request ID',
      'actorIPAddr': 'Actor/User',
      'actor': 'User',
      'actorID': 'User ID',
      'severity': 'Severity',
      'resource': 'Resource',
      'action': 'Action',
      'headerAdditional': 'Additional information',
      'description': 'Description',
      'error': 'Error',
    },
  },
}
