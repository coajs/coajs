import { env_build_in } from './env_build_in'
import { env_example } from './env_example'

declare type EnvBuildIn = typeof env_build_in
declare type EnvExample = typeof env_example

export interface Env extends EnvBuildIn, EnvExample {}

export interface EnvExt extends Env {}