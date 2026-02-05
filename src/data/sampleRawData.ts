export const sampleRawData = {
  patientInfo: {
    name: '张三',
    sex: '男',
    age: 32,
    id: '110101199201012345',
    visitNo: 'V-20260205-32'
  },
  orderInfo: {
    reportNo: 'RPT-20260205-009',
    orderNo: 'ORD-20260205-009',
    sampleTime: '2026-02-04 09:12',
    reportTime: '2026-02-05 10:15',
    department: '检验科'
  },
  sourceInfo: {
    labName: '华北第三方实验室',
    system: 'LIS-X'
  },
  doctorInfo: {
    name: '赵医生',
    auditor: '孙医生'
  },
  results: [
    {
      item: '白细胞计数',
      value: '12.2',
      unit: '10^9/L',
      ref: '4.0-10.0',
      flag: 'H'
    },
    {
      item: '血红蛋白',
      value: '106',
      unit: 'g/L',
      ref: '120-160',
      flag: 'L'
    },
    {
      item: '血小板',
      value: '236',
      unit: '10^9/L',
      ref: '100-300',
      flag: ''
    }
  ]
}
