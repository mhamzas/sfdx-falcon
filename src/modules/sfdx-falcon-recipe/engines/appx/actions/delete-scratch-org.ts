//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-recipe/actions/delete-scratch-org.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @version       1.0.0
 * @license       MIT
 * @summary       Exposes the CLI Command force:org:delete
 * @description   Marks the specified scratch org for deletion.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import Local Modules
import {SfdxFalconDebug}        from  '../../../../sfdx-falcon-debug';            // Why?
import {executeSfdxCommand}     from  '../../../../sfdx-falcon-executors/sfdx';   // Why?
import {SfdxShellResult}        from  '../../../../sfdx-falcon-executors/sfdx';   // Why?

// Import Internal Engine Modules
import {AppxEngineAction}         from  '../../appx/actions';                       // Why?
import {AppxEngineActionContext}  from  '../../appx';                               // Why?
import {AppxEngineActionType}     from  '../../appx/';                              // Why?

// Set the File Local Debug Namespace
const dbgNs     = 'delete-scratch-org-action:';
const clsDbgNs  = 'DeleteScratchOrgAction:';

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       DeleteScratchOrgAction
 * @extends     AppxEngineAction
 * @description Implements the action "delete-scratch-org".
 * @version     1.0.0
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class DeleteScratchOrgAction extends AppxEngineAction {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initializeAction
   * @returns     {void}
   * @description Sets member variables based on the specifics of this action.
   *              Think of it as a consstructor for this instance of the derived
   *              class.
   * @version     1.0.0
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected initializeAction():void {

    // Set values for all the base member vars to better define THIS AppxEngineAction.
    this.actionType       = AppxEngineActionType.SFDX_CLI_COMMAND
    this.actionName       = 'delete-scratch-org';
    this.command          = 'force:org:delete';
    this.description      = 'Delete Scratch Org';
    this.successDelay     = 2;
    this.errorDelay       = 2;
    this.progressDelay    = 1000;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      validateActionOptions
   * @param       {any}   actionOptions Required. The options that should be
   *              validated because they are required by this specific action.
   * @returns     {void}  
   * @description Given an object containing Action Options, make sure that 
   *              everything expected by this Action in order to properly
   *              execute has been provided.
   * @version     1.0.0
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected validateActionOptions(actionOptions:any):void {
    if (typeof actionOptions.scratchOrgAlias === 'undefined') throw new Error(`ERROR_MISSING_OPTION: 'scratchOrgAlias'`);
  }  

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      executeAction
   * @param       {any}   actionOptions Optional. Any options that the command
   *              execution logic will require in order to properly do its job.
   * @returns     {Promise<AppxEngineActionResult>}
   * @description Performs the custom logic that's wrapped by the execute method
   *              of the base class.
   * @version     1.0.0
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async executeAction(actionContext:AppxEngineActionContext, actionOptions:any={}):Promise<SfdxShellResult> {

    // Set the progress, error, and success messages for this action execution.
    this.progressMessage  = `Marking scratch org '${actionOptions.scratchOrgAlias}' for deletion`;
    this.errorMessage     = `Request to mark scratch org '${actionOptions.scratchOrgAlias}' for deletion failed`;
    this.successMessage   = `Scratch org '${actionOptions.scratchOrgAlias}' successfully marked for deletion`;

    // Create an SFDX Command Definition object to specify which command the CLI will run.
    this.sfdxCommandDef = {
      command:      this.command,
      progressMsg:  this.progressMessage,
      errorMsg:     this.errorMessage,
      successMsg:   this.successMessage,
      observer:     actionContext.listrExecOptions.observer,
      commandArgs:  [] as [string],
      commandFlags: {
        FLAG_TARGETUSERNAME:        actionContext.targetOrg.alias,
        FLAG_TARGETDEVHUBUSERNAME:  actionContext.devHubAlias,
        FLAG_NOPROMPT:              true,
        FLAG_JSON:                  true,
        FLAG_LOGLEVEL:              actionContext.logLevel
      }
    }
    SfdxFalconDebug.obj(`FALCON_EXT:${dbgNs}`, this.sfdxCommandDef, `${clsDbgNs}executeAction:sfdxCommandDef: `);

    // Execute the SFDX Command using an SFDX Executor. Base class handles success/error.
    let sfdxShellResult = await executeSfdxCommand(this.sfdxCommandDef)
                                .catch(sfdxShellResult => {
                                  SfdxFalconDebug.obj(`FALCON_EXT:${dbgNs}`, sfdxShellResult, `${clsDbgNs}executeAction:executeSfdxCommand:catch:sfdxShellResult: `);
                                  // We need to suppress errors here because we might be trying to delete
                                  // a scratch org that does not exist.
                                  // Override the status so the caller does not think this call returned an error
                                  sfdxShellResult.status = 0;
                                  return sfdxShellResult;
                                });
    return sfdxShellResult;
  }
}