//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-recipe/actions/create-user.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Uses JSForce to create a user in the Target Org.
 * @description   Uses JSForce to create a user in the Target Org.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import Local Modules
import {readConfigFile}               from  '../../../../sfdx-falcon-util';   // Function. Reads a JSON config file from disk and returns as JS Object.
import {SfdxFalconResult}             from  '../../../../sfdx-falcon-result'; // Class. Provides framework for bubbling "results" up from nested calls.
import {SfdxFalconResultType}         from  '../../../../sfdx-falcon-result'; // Enum. Represents types of SfdxFalconResults.
// Executor Imports
import {createUser}                   from  '../../../executors/hybrid';  // Function. Hybrid executor
// Engine/Action Imports
import {AppxEngineAction}             from  '../../appx/actions'; // Abstract class. Extend this to build a custom Action for the Appx Recipe Engine.
import {AppxEngineActionContext}      from  '../../appx';         // Interface. Represents the context of an Appx Recipe Engine.
import {SfdxFalconActionType}         from  '../../../types/';    // Enum. Represents types of SfdxFalconActions.
// Import Utility Functions
import {createUniqueUsername}         from  '../../../../sfdx-falcon-util'; // Function. Adds a UUID to a username to create something unique.


// Set the File Local Debug Namespace
const dbgNs     = 'ACTION:create-user:';
const clsDbgNs  = 'CreateUserAction:';

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       CreateUserAction
 * @extends     AppxEngineAction
 * @description Implements the action "create-user".
 * @version     1.0.0
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class CreateUserAction extends AppxEngineAction {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initializeAction
   * @returns     {void}
   * @description Sets member variables based on the specifics of this action.
   * @version     1.0.0
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected initializeAction():void {

    // Set values for all the base member vars to better define THIS AppxEngineAction.
    this.actionType       = SfdxFalconActionType.SFDC_API;
    this.actionName       = 'create-user';
    this.command          = 'FALCON_INTERNAL:create-user';
    this.description      = 'Create User';
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
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected validateActionOptions(actionOptions:any):void {
    if (typeof actionOptions.definitionFile === 'undefined') throw new Error(`ERROR_MISSING_OPTION: 'definitionFile'`);
    if (typeof actionOptions.sfdxUserAlias  === 'undefined') throw new Error(`ERROR_MISSING_OPTION: 'sfdxUserAlias'`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      executeAction
   * @param       {any}   actionOptions Optional. Any options that the command
   *              execution logic will require in order to properly do its job.
   * @returns     {Promise<SfdxFalconResult>} Resolves with an SfdxFalconResult
   *              of type ACTION that has one or more EXECUTOR Results as 
   *              children.
   * @description Performs the custom logic that's wrapped by the execute method
   *              of the base class.
   * @version     1.0.0
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async executeAction(actionContext:AppxEngineActionContext, actionOptions:any={}):Promise<SfdxFalconResult> {

    // Get an SFDX-Falcon Result that's customized for this Action.
    let actionResult = this.createActionResult(
      actionContext, actionOptions,
      { startNow:       true,
        bubbleError:    true,
        bubbleFailure:  true});
    // Add additional DETAIL for this Result (beyond what is added by createActionResult().
    actionResult.detail = {...{
      userDefinition:     null,
      uniqueUsername:     null,
      defaultPassword:    null,
      executorMessages:   null
    }};
    actionResult.debugResult(`Initialized`, `${dbgNs}executeAction`);

    // Find and read the user definition file.
    let userDefinition = await readConfigFile(actionContext.projectContext.configPath, actionOptions.definitionFile)
      .catch(error => {actionResult.throw(error)});
    actionResult.detail.userDefinition = userDefinition;
    actionResult.debugResult(`User Definition File Read`, `${dbgNs}executeAction`);

    // Create a unique username based on what's in the definition file.
    let uniqueUsername  = createUniqueUsername(userDefinition.Username);
    actionResult.detail.uniqueUsername = uniqueUsername;
    actionResult.debugResult(`Unique Username Generated`, `${dbgNs}executeAction`);

    // Determine what the appropriate default password should be.
    let defaultPassword = determineDefaultPassword(userDefinition.password);
    actionResult.detail.defaultPassword = defaultPassword;
    actionResult.debugResult(`Default Password Determined`, `${dbgNs}executeAction`);

    // Define the messages for this command.
    let executorMessages = {
      progressMsg:  `Creating User '${uniqueUsername}' in ${actionContext.targetOrg.alias}`,
      errorMsg:     `Failed to create User '${uniqueUsername}' in ${actionContext.targetOrg.alias}`,
      successMsg:   `User '${uniqueUsername}' created successfully`,
    }
    actionResult.detail.executorMessages = executorMessages;
    actionResult.debugResult(`Executor Messages Set`, `${dbgNs}executeAction`);
  
    // Run the executor then return or throw the result. If you want to override error handling, do it here.
    return await createUser( uniqueUsername, defaultPassword, userDefinition, 
                                actionContext.targetOrg, executorMessages, 
                                actionContext.listrExecOptions.observer)
      .then(executorResult => {

        actionResult.debugResult(`Executor Promise Resolved`, `${dbgNs}executeAction`);

        // Add the EXECUTOR result as a child of this function's ACTION Result, then return the ACTION Result.
        return actionResult.addChild(executorResult);
      })
      .catch(executorResult  => {

        actionResult.debugResult(`Executor Promise Rejected`, `${dbgNs}executeAction`);

        // Make sure any rejected promises are wrapped as an ERROR Result.
        executorResult = SfdxFalconResult.wrapRejectedPromise(executorResult, 'hybrid:createUser', SfdxFalconResultType.EXECUTOR);
        
        // Debug the rejected and wrapped EXECUTOR Result
        executorResult.debugResult(`Rejected Promise Wrapped as SFDX-Falcon Error`, `${dbgNs}executeAction`);

        // If the ACTION Result's "bubbleError" is TRUE, addChild() will throw an Error.
        return actionResult.addChild(executorResult);
      });
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDefaultPassword
 * @param       {string}  suggestedPassword Optional. This will usually be returned as-is if it's
 *              provided. Otherwise this will be determined by some "default processing" logic.
 * @returns     {string}  Either a reflectoin of the suggested password, or a better one.
 * @description Given a "suggested password", this function will determine if it's OK to use that
 *              password or supply a different one as a replacement.
 * @version     1.0.0
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function determineDefaultPassword(suggestedPassword:string):string {
  if (! suggestedPassword) {
    return '1HappyCloud';
  }
  else {
    return suggestedPassword;
  }
}