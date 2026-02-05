export const defaultStandardData = {
  patient: {
    name: '未命名',
    gender: '',
    age: '',
    idNo: '',
    visitNo: ''
  },
  order: {
    reportNo: 'RPT-20260205-001',
    orderNo: 'ORD-20260205-001',
    sampleTime: '2026-02-05 08:30',
    reportTime: '2026-02-05 10:30',
    department: '检验科'
  },
  results: [
    {
      itemName: '血红蛋白',
      value: '132',
      unit: 'g/L',
      refRange: '120-160',
      flag: ''
    }
  ],
  source: {
    labName: '第三方实验室 A',
    system: 'LIS-Bridge'
  },
  org: {
    name: '示例医院',
    address: '示例市示例区示例路 88 号',
    phone: '010-88888888'
  },
  doctor: {
    name: '李医生',
    auditor: '王医生'
  }
}

export type StandardReportData = typeof defaultStandardData
