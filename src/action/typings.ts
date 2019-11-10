import { Context } from '..'

interface ActionOptions {
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

export interface Action {
  [path: string]: {
    options: ActionOptions,
    default (ctx: Context): Promise<void>;
  }
}


