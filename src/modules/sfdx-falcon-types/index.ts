//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-types/index.d.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       ???
 * @description   ???
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import {AnyJson}    from  '@salesforce/ts-types';
import {Observable} from  'rx';

export interface AppxDemoLocalConfig {
  demoValidationOrgAlias: string;
  demoDeploymentOrgAlias: string;
  devHubAlias:            string;
  envHubAlias:            string;
}

export interface AppxDemoProjectConfig {
  demoAlias:        string;
  demoConfig:       string;
  demoTitle:        string;
  demoType:         string;
  demoVersion:      string;
  gitHubUrl:        string;
  gitRemoteUri:     string;
  partnerAlias:     string;
  partnerName:      string;
  schemaVersion:    string;
}

export interface AppxDemoSequenceOptions {
  scratchDefJson:       string;
  rebuildValidationOrg: boolean;
  skipActions:          [string];
}

export interface AppxPackageLocalConfig {
  demoValidationOrgAlias: string;
  demoDeploymentOrgAlias: string;
  devHubAlias:            string;
  envHubAlias:            string;
}

export interface AppxPackageProjectConfig {
  gitHubUrl:          string;
  gitRemoteUri:       string;
  metadataPackageId:  string;
  namespacePrefix:    string;
  packageName:        string;
  packageVersionId: {
    stable: string;
    beta:   string;
  };
  partnerAlias:       string;
  partnerName:        string;
  projectAlias:       string;
  projectName:        string;
  projectType:        string;
  schemaVersion:      string;
}

export interface AppxPackageSequenceOptions {
  scratchDefJson:    string;
}

export interface FalconConfig {
  appxProject?:  AppxPackageProjectConfig;
  appxDemo?:     AppxDemoProjectConfig;
}

export interface FalconCommandContext extends FalconSequenceContext {
  commandObserver:  any;  // tslint:disable-line: no-any
}

// TODO: Need to finish defining FalconCommandHandler
export interface FalconCommandHandler {
  changeMe: string;
}

export interface FalconCommandSequence {
  sequenceName:     string;
  sequenceType:     string;
  sequenceVersion:  string;
  description:      string;
  options:          any;  // tslint:disable-line: no-any
  sequenceGroups:   [FalconCommandSequenceGroup];
  handlers:         [FalconCommandHandler];
  schemaVersion:    string;
}

export interface FalconCommandSequenceGroup {
  groupId:        string;
  groupName:      string;
  description:    string;
  sequenceSteps:  FalconCommandSequenceStep[];
}

export interface FalconCommandSequenceStep {
  stepName:     string;
  description:  string;
  action:       string;
  options:      any;  // tslint:disable-line: no-any
  onSuccess?: {
    handler:  string;
  };
  onError?: {
    handler:  string;
  };
}

export interface SfdxFalconJsonResponse {
  falconStatus: number;
  falconResult: AnyJson;
}

export interface FalconSequenceContext {
  devHubAlias:        string;
  targetOrgAlias:     string;
  targetIsScratchOrg: boolean;
  projectPath:        string;
  configPath:         string;
  mdapiSourcePath:    string;
  dataPath:           string;
  logLevel:           'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  sequenceObserver:   any;  // tslint:disable-line: no-any
}

export interface ListrTask {
  title:    string;
  task:     ListrTaskFunction;
  skip?:    boolean|ListrSkipFunction;
  enabled?: boolean|ListrEnabledFunction;
}

export type ListrEnabledFunction =
  (context?:any)=> boolean; // tslint:disable-line: no-any

export type ListrSkipFunction =
  (context?:any) => boolean|string|Promise<boolean|string>;  // tslint:disable-line: no-any

export type ListrTaskFunction =
  (context?:ListrContext, task?:ListrTask) => void|Promise<void>|Observable<any>; // tslint:disable-line: no-any

export interface ListrExecutionOptions {
  listrContext: any;  // tslint:disable-line: no-any
  listrTask:    any;  // tslint:disable-line: no-any
  observer:     any;  // tslint:disable-line: no-any
}

export type ListrContext    = any;  // tslint:disable-line: no-any
export type ListrObservable = any;  // tslint:disable-line: no-any

export enum SfdxCliLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO  = 'info',
  WARN  = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}
