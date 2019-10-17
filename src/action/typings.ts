import { IContext } from '..'

interface IActionOptions {
  name?: string,
  desc?: string,
  router?: any,
  group?: string,
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  param?: { [i: string]: any },
  query?: { [i: string]: any },
  body?: { [i: string]: any },
  result?: { [i: string]: any },
  note?: { [i: string]: any },
  delete?: boolean,
}

export interface IAction {
  [path: string]: {
    options: IActionOptions,
    default (ctx: IContext): Promise<void>;
  }
}


