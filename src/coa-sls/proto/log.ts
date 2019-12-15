export default {
  'message Log':
    {
      'required uInt32 time': 1,
      'message Content':
        {
          'required string key': 1,
          'required string value': 2
        },
      'repeated Content contents': 2
    },
  'message LogTag':
    {
      'required string Key': 1,
      'required string Value': 2
    },
  'LogGroup':
    {
      'repeated Log logs': 1,
      'optional string category': 2,
      'optional string topic': 3,
      'optional string source': 4,
      'optional string MachineUUID': 5,
      'repeated LogTag LogTags': 6

    },
  'LogStore':
    {
      'repeated Log logs': 1,
      'optional string category': 2,
      'optional string topic': 3,
      'optional string source': 4
    },
  'LogGroupList':
    {
      'message LogGroup':
        {
          'repeated Log logs': 1,
          'optional string category': 2,
          'optional string topic': 3,
          'optional string source': 4,
          'optional string MachineUUID': 5,
          'repeated LogTag LogTags': 6

        },
      'repeated LogGroup logGroupList': 1
    }
} as any