export const STANDARD_FIELDS = [
  { label: '患者姓名', path: 'patient.name', group: '患者' },
  { label: '患者性别', path: 'patient.gender', group: '患者' },
  { label: '患者年龄', path: 'patient.age', group: '患者' },
  { label: '患者证件号', path: 'patient.idNo', group: '患者' },
  { label: '就诊号', path: 'patient.visitNo', group: '患者' },
  { label: '报告号', path: 'order.reportNo', group: '订单' },
  { label: '申请单号', path: 'order.orderNo', group: '订单' },
  { label: '采样时间', path: 'order.sampleTime', group: '订单' },
  { label: '报告时间', path: 'order.reportTime', group: '订单' },
  { label: '检验科室', path: 'order.department', group: '订单' },
  { label: '申请医生', path: 'doctor.name', group: '医护' },
  { label: '审核医生', path: 'doctor.auditor', group: '医护' },
  { label: '来源实验室', path: 'source.labName', group: '来源' },
  { label: '来源系统', path: 'source.system', group: '来源' },
  { label: '机构名称', path: 'org.name', group: '机构' },
  { label: '机构地址', path: 'org.address', group: '机构' },
  { label: '机构电话', path: 'org.phone', group: '机构' }
]

export const RESULT_ITEM_FIELDS = [
  { label: '项目名称', key: 'itemName' },
  { label: '结果值', key: 'value' },
  { label: '单位', key: 'unit' },
  { label: '参考范围', key: 'refRange' },
  { label: '结果提示', key: 'flag' }
]
