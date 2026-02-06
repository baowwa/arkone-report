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
    department: '检验科',
    specimenType: '',
    method: '',
    recheck: '',
    testDate: '',
    subtype: '',
    coverage: '',
    analysisSystem: '',
    threshold: '',
    mutationCount: ''
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
  summaryCards: [
    {
      title: '结核分枝杆菌',
      value: '结核分枝杆菌复合群',
      tone: 'rose',
      iconKey: 'microbe'
    },
    {
      title: '非结核分枝杆菌',
      value: '未检出',
      tone: 'teal',
      iconKey: 'bacteria'
    },
    {
      title: '其他特殊病原体',
      value: '金黄色葡萄球菌',
      tone: 'amber',
      iconKey: 'virus'
    }
  ],
  resistanceResults: [
    {
      category: '结核分枝杆菌复合群',
      name: '结核分枝杆菌复合群',
      latinName: 'Mycobacterium tuberculosis complex',
      resistantDrug: '异烟肼, 利福平, 乙胺丁醇, 利福喷丁'
    }
  ],
  hivResistanceResults: [
    {
      geneRegion: '蛋白酶区 (PR)',
      mutation: '主要突变: 无; 次要突变: 无',
      drug: '阿扎那韦 (ATV)',
      level: '0 - 敏感'
    },
    {
      geneRegion: '',
      mutation: '',
      drug: '达芦那韦 (DRV)',
      level: '0 - 敏感'
    },
    {
      geneRegion: '',
      mutation: '',
      drug: '洛匹那韦 (LPV)',
      level: '0 - 敏感'
    },
    {
      geneRegion: '逆转录酶区 (RT)',
      mutation: 'NRTI相关突变: 无',
      drug: '齐多夫定 (AZT)',
      level: '0 - 敏感'
    },
    {
      geneRegion: '',
      mutation: '',
      drug: '替诺福韦 (TDF)',
      level: '0 - 敏感'
    },
    {
      geneRegion: '整合酶区 (IN)',
      mutation: 'INSTI相关主要突变: 无',
      drug: '多替拉韦 (DTG)',
      level: '0 - 敏感'
    }
  ],
  source: {
    labName: '第三方实验室 A',
    system: 'LIS-Bridge'
  },
  org: {
    name: '示例医院',
    address: '示例市示例区示例路 88 号',
    phone: '010-88888888',
    logo:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' rx='20' fill='%230f766e'/><text x='60' y='72' font-family='Arial' font-size='36' text-anchor='middle' fill='white'>ARK</text></svg>"
  },
  doctor: {
    name: '李医生',
    auditor: '王医生'
  }
}

export type StandardReportData = typeof defaultStandardData
