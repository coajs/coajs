import { _, Dic } from '../..'

export declare type TPOParam = { pick?: string[], omit?: string[] }
export declare type TSortParam = (string | 1 | -1)[][] | Dic<1 | -1>
export declare type TSchemeId = { _id: string, created: number, updated: string }

export default new class {
  po2project (po: TPOParam = {}, key: string = '') {
    const project = {} as Dic<1 | 0>, pick = po.pick || [], omit = po.omit || []
    if (pick.length) {
      if (key !== '') project[key] = 1
      _.forEach(pick, v => project[v] = 1)
    } else {
      project._id = 0
      if (omit.length) _.forEach(omit, v => project[v] = 0)
    }
    return project
  }
}
